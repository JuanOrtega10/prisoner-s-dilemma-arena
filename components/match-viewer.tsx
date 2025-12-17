"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useGame } from "@/lib/game-context"
import { TournamentStandings } from "./tournament-standings"
import { RoundDetailViewer } from "./round-detail-viewer"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SystemPromptModal } from "./system-prompt-modal"
import { AboutDilemmaModal } from "./about-dilemma-modal"
import { FIXED_TEMPERATURE } from "@/lib/constants"
import { ArrowLeft, Pause, Play, FastForward, Thermometer, Loader2 } from "lucide-react"

const ROUND_COUNTDOWN = 2 // seconds between rounds
const MATCH_COUNTDOWN = 5 // seconds between matches
const MAX_RETRIES = 3 // maximum retries for failed rounds
const RETRY_DELAY = 2000 // delay between retries in ms

export function MatchViewer() {
  const { tournament, nextMatch, setCurrentView, playRound } = useGame()
  const [isPaused, setIsPaused] = useState(false)
  const [isSimulating, setIsSimulating] = useState(true)
  const [currentStatus, setCurrentStatus] = useState("Starting tournament...")
  const [countdownSeconds, setCountdownSeconds] = useState(ROUND_COUNTDOWN)
  const [countdownMax, setCountdownMax] = useState(ROUND_COUNTDOWN)
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState(false)
  const [isProcessingRound, setIsProcessingRound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const abortRef = useRef(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const totalMatches = tournament?.matches.length ?? 0
  const completedMatches = tournament?.matches.filter((m) => m.isComplete).length ?? 0
  const currentMatchIndex = tournament?.currentMatchIndex ?? 0
  const currentMatch = tournament?.matches[currentMatchIndex]
  const roundsPerMatch = tournament?.roundsPerMatch ?? 5
  const currentRound = currentMatch?.currentRound ?? 1
  const totalRounds = totalMatches * roundsPerMatch
  const completedRounds = completedMatches * roundsPerMatch + (currentMatch ? currentMatch.rounds.length : 0)
  const overallProgress = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0

  // Clear countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  // Handle countdown timer
  useEffect(() => {
    if (isWaitingForNextRound && !isPaused && countdownSeconds > 0) {
      countdownRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setIsWaitingForNextRound(false)
            return countdownMax
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
        }
      }
    }
  }, [isWaitingForNextRound, isPaused, countdownSeconds, countdownMax])

  const runSimulation = useCallback(async () => {
    if (!tournament || !currentMatch || abortRef.current || isProcessingRound) return

    // Check if tournament is complete
    if (tournament.isComplete) {
      setCurrentView("matchReview")
      return
    }

    // Check if current match is complete
    if (currentMatch.currentRound > currentMatch.maxRounds) {
      // Move to next match or finish
      if (currentMatchIndex >= totalMatches - 1) {
        setCurrentView("matchReview")
        return
      }
      const tournamentComplete = nextMatch()
      if (tournamentComplete) {
        setCurrentView("matchReview")
      }
      return
    }

    setIsProcessingRound(true)
    const currentRoundNum = currentMatch.currentRound
    setCurrentStatus(
      `Simulating match ${currentMatchIndex + 1} of ${totalMatches} · round ${currentRoundNum} of ${roundsPerMatch}`,
    )

    const attemptRound = async (attempt: number): Promise<boolean> => {
      try {
        const historyForA = currentMatch.rounds.map((r) => ({
          round: r.round,
          yourPledge: r.modelAPledge,
          opponentPledge: r.modelBPledge,
          yourMove: r.modelADecision,
          opponentMove: r.modelBDecision,
        }))

        const historyForB = currentMatch.rounds.map((r) => ({
          round: r.round,
          yourPledge: r.modelBPledge,
          opponentPledge: r.modelAPledge,
          yourMove: r.modelBDecision,
          opponentMove: r.modelADecision,
        }))

        // Call both models in parallel
        const [resA, resB] = await Promise.all([
          fetch("/api/play-round", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId: currentMatch.modelA.id,
              opponentId: currentMatch.modelB.displayName,
              roundNumber: currentRoundNum,
              maxRounds: currentMatch.maxRounds,
              history: historyForA,
            }),
          }),
          fetch("/api/play-round", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId: currentMatch.modelB.id,
              opponentId: currentMatch.modelA.displayName,
              roundNumber: currentRoundNum,
              maxRounds: currentMatch.maxRounds,
              history: historyForB,
            }),
          }),
        ])

        if (abortRef.current) return false

        // Check HTTP status
        if (!resA.ok || !resB.ok) {
          throw new Error(`API error: ${resA.status} / ${resB.status}`)
        }

        const [responseA, responseB] = await Promise.all([resA.json(), resB.json()])

        // Validate responses have required fields
        if (!responseA.decision || !responseB.decision) {
          throw new Error("Invalid response: missing decision field")
        }

        // Normalize decisions to ensure they're valid
        const decisionA = responseA.decision === "C" || responseA.decision === "D" 
          ? responseA.decision 
          : "C" // Default to cooperate if invalid
        const decisionB = responseB.decision === "C" || responseB.decision === "D" 
          ? responseB.decision 
          : "C"

        // Record the round
        playRound(
          responseA.pledge || "No pledge provided",
          decisionA,
          responseA.reason || "No reasoning provided",
          responseA.brokePledge ?? false,
          responseB.pledge || "No pledge provided",
          decisionB,
          responseB.reason || "No reasoning provided",
          responseB.brokePledge ?? false,
        )

        setRetryCount(0) // Reset retry count on success
        return true
      } catch (error) {
        console.error(`Round attempt ${attempt} failed:`, error)
        
        if (attempt < MAX_RETRIES) {
          setCurrentStatus(`Error in round ${currentRoundNum}, retrying (${attempt}/${MAX_RETRIES})...`)
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
          return attemptRound(attempt + 1)
        }
        
        // Max retries reached, use default values to continue
        console.error(`Max retries reached for round ${currentRoundNum}, using defaults`)
        setCurrentStatus(`Round ${currentRoundNum} failed, using default values...`)
        
        // Record round with default cooperate values to keep tournament moving
        playRound(
          "Technical error occurred",
          "C",
          "Default decision due to error",
          false,
          "Technical error occurred", 
          "C",
          "Default decision due to error",
          false,
        )
        
        setRetryCount(0)
        return true
      }
    }

    const success = await attemptRound(1)
    
    if (!success || abortRef.current) {
      setIsProcessingRound(false)
      return
    }

    setIsProcessingRound(false)
    
    // Start countdown for next round (unless match is complete)
    // Note: currentRoundNum is the round we just completed
    // So we need to check if the NEXT round number would exceed maxRounds
    const nextRoundNumber = currentRoundNum + 1
    if (nextRoundNumber <= currentMatch.maxRounds) {
      setCountdownMax(ROUND_COUNTDOWN)
      setCountdownSeconds(ROUND_COUNTDOWN)
      setIsWaitingForNextRound(true)
    } else {
      // Match is complete, wait with longer countdown before next match
      setCurrentStatus("Match complete!")
      setCountdownMax(MATCH_COUNTDOWN)
      setCountdownSeconds(MATCH_COUNTDOWN)
      setIsWaitingForNextRound(true)
      await new Promise((resolve) => setTimeout(resolve, MATCH_COUNTDOWN * 1000))
      
      if (abortRef.current) return
      
      if (currentMatchIndex >= totalMatches - 1) {
        setCurrentView("matchReview")
      } else {
        const tournamentComplete = nextMatch()
        if (tournamentComplete) {
          setCurrentView("matchReview")
        }
      }
    }
  }, [
    tournament,
    currentMatch,
    currentMatchIndex,
    totalMatches,
    roundsPerMatch,
    nextMatch,
    playRound,
    setCurrentView,
    isProcessingRound,
  ])

  // Trigger simulation when ready
  useEffect(() => {
    if (!isSimulating || isPaused || !tournament || isWaitingForNextRound || isProcessingRound) return

    const timer = setTimeout(() => {
      runSimulation()
    }, 500)

    return () => clearTimeout(timer)
  }, [isSimulating, isPaused, tournament, currentMatchIndex, currentRound, runSimulation, isWaitingForNextRound, isProcessingRound])

  const handleSkipToResults = () => {
    abortRef.current = true
    setIsSimulating(false)
    setCurrentView("matchReview")
  }

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev)
  }

  const handleContinueFromMatch = () => {
    if (currentMatchIndex >= totalMatches - 1) {
      setCurrentView("matchReview")
    } else {
      const tournamentComplete = nextMatch()
      if (tournamentComplete) {
        setCurrentView("matchReview")
      }
    }
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No tournament in progress</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <p className="text-sm font-medium">
                  Match {currentMatchIndex + 1} of {totalMatches}
                </p>
                <p className="text-xs text-muted-foreground">{tournament.models.length} models competing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs font-mono">
                <Thermometer className="h-3 w-3 mr-1" />
                temp={FIXED_TEMPERATURE}
              </Badge>
              <SystemPromptModal />
              <AboutDilemmaModal />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tournament Progress</p>
                <p className="text-sm font-medium">{Math.round(overallProgress)}%</p>
              </div>
              <Progress value={overallProgress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleTogglePause} className="w-24 bg-transparent">
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSkipToResults}>
                <FastForward className="h-4 w-4 mr-1" />
                Skip to Results
              </Button>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-1">
                {isProcessingRound && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{currentStatus}</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground w-24 text-right">
              {completedRounds} / {totalRounds} rounds
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Standings */}
          <div className="lg:col-span-1">
            <TournamentStandings modelStats={tournament.modelStats} />
          </div>

          {/* Right: Current Match with RoundDetailViewer */}
          <div className="lg:col-span-2">
            {currentMatch && (
              <RoundDetailViewer
                match={currentMatch}
                mode="live"
                isPaused={isPaused}
                onPauseToggle={handleTogglePause}
                countdownSeconds={countdownSeconds}
                countdownMax={countdownMax}
                isWaitingForNextRound={isWaitingForNextRound}
                onContinue={handleContinueFromMatch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
