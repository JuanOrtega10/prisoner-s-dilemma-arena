"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { MatchState, RoundResult, Decision } from "@/lib/types"
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  AlertTriangle,
  Swords,
  Timer,
} from "lucide-react"

interface RoundDetailViewerProps {
  match: MatchState
  mode: "live" | "review"
  selectedRound?: number
  onRoundChange?: (round: number) => void
  onContinue?: () => void
  isPaused?: boolean
  onPauseToggle?: () => void
  countdownSeconds?: number
  countdownMax?: number
  isWaitingForNextRound?: boolean
}

const DecisionBadge = ({ decision, broke }: { decision: Decision; broke?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${
        decision === "C" 
          ? "bg-gradient-to-br from-emerald-400 to-emerald-600" 
          : "bg-gradient-to-br from-red-400 to-red-600"
      }`}
    >
      {decision}
    </div>
    <span className="text-sm font-medium">
      {decision === "C" ? "Cooperate" : "Defect"}
    </span>
    {broke && (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Broke pledge
      </Badge>
    )}
  </div>
)

export function RoundDetailViewer({
  match,
  mode,
  selectedRound,
  onRoundChange,
  onContinue,
  isPaused = false,
  onPauseToggle,
  countdownSeconds = 2,
  countdownMax = 2,
  isWaitingForNextRound = false,
}: RoundDetailViewerProps) {
  const [viewingRound, setViewingRound] = useState(selectedRound ?? match.rounds.length)

  // Sync viewingRound with selectedRound prop or latest round
  useEffect(() => {
    if (selectedRound !== undefined) {
      setViewingRound(selectedRound)
    } else if (match.rounds.length > 0) {
      setViewingRound(match.rounds.length)
    }
  }, [selectedRound, match.rounds.length])

  const currentRoundData: RoundResult | undefined = match.rounds[viewingRound - 1]
  const isLatestRound = viewingRound === match.rounds.length
  const canGoPrev = viewingRound > 1
  const canGoNext = viewingRound < match.rounds.length
  const isMatchComplete = match.currentRound > match.maxRounds

  const handlePrevRound = () => {
    if (canGoPrev) {
      const newRound = viewingRound - 1
      setViewingRound(newRound)
      onRoundChange?.(newRound)
    }
  }

  const handleNextRound = () => {
    if (canGoNext) {
      const newRound = viewingRound + 1
      setViewingRound(newRound)
      onRoundChange?.(newRound)
    }
  }

  // Calculate match scores
  const scoreA = match.rounds.reduce((sum, r) => sum + r.modelAPayoff, 0)
  const scoreB = match.rounds.reduce((sum, r) => sum + r.modelBPayoff, 0)

  const countdownProgress = (countdownSeconds / countdownMax) * 100

  if (!currentRoundData && match.rounds.length === 0) {
    return (
      <Card className="flex-1">
        <CardContent className="py-12 text-center text-muted-foreground">
          <div className="animate-pulse">
            <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for first round...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentRoundData) {
    return null
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            {match.modelA.displayName} vs {match.modelB.displayName}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span>
              {match.modelA.displayName}: <strong>{scoreA}</strong>
            </span>
            <span className="text-muted-foreground">vs</span>
            <span>
              {match.modelB.displayName}: <strong>{scoreB}</strong>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Round History Bar */}
        {match.rounds.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Match Progress</span>
              <span>{match.rounds.length} / {match.maxRounds} rounds</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: match.maxRounds }, (_, i) => {
                const roundNum = i + 1
                const roundData = match.rounds[roundNum - 1]
                const isCurrentViewing = roundNum === viewingRound
                const isCompleted = roundData !== undefined
                
                return (
                  <button
                    key={roundNum}
                    onClick={() => {
                      if (isCompleted) {
                        setViewingRound(roundNum)
                        onRoundChange?.(roundNum)
                      }
                    }}
                    disabled={!isCompleted}
                    className={`
                      flex-1 h-10 rounded-md flex flex-col items-center justify-center gap-0.5
                      transition-all duration-200 border-2
                      ${isCurrentViewing 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent'}
                      ${isCompleted 
                        ? 'cursor-pointer hover:scale-105' 
                        : 'cursor-default opacity-40'}
                      ${!isCompleted ? 'bg-muted/30' : 'bg-muted/50'}
                    `}
                    title={isCompleted 
                      ? `Round ${roundNum}: ${match.modelA.displayName} ${roundData.modelADecision} vs ${roundData.modelBDecision} ${match.modelB.displayName}` 
                      : `Round ${roundNum}: Pending`}
                  >
                    <span className="text-[10px] text-muted-foreground font-medium">R{roundNum}</span>
                    {isCompleted && (
                      <div className="flex gap-0.5">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            roundData.modelADecision === 'C' 
                              ? 'bg-emerald-500' 
                              : 'bg-red-500'
                          }`}
                          title={`${match.modelA.displayName}: ${roundData.modelADecision === 'C' ? 'Cooperate' : 'Defect'}`}
                        />
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            roundData.modelBDecision === 'C' 
                              ? 'bg-emerald-500' 
                              : 'bg-red-500'
                          }`}
                          title={`${match.modelB.displayName}: ${roundData.modelBDecision === 'C' ? 'Cooperate' : 'Defect'}`}
                        />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Cooperate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Defect</span>
              </div>
            </div>
          </div>
        )}

        {/* Round Navigation */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevRound}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-4 py-1">
              Round {viewingRound} of {match.maxRounds}
            </Badge>
            {!isLatestRound && mode === "live" && (
              <Badge variant="secondary" className="text-xs">
                Viewing history
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextRound}
            disabled={!canGoNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Pledges Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              {match.modelA.displayName}'s Pledge
            </p>
            <p className="text-sm italic leading-relaxed">
              "{currentRoundData.modelAPledge}"
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              {match.modelB.displayName}'s Pledge
            </p>
            <p className="text-sm italic leading-relaxed">
              "{currentRoundData.modelBPledge}"
            </p>
          </div>
        </div>

        {/* Decisions Section */}
        <div className="flex justify-center items-center gap-16 py-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {match.modelA.displayName}
            </p>
            <DecisionBadge
              decision={currentRoundData.modelADecision}
              broke={currentRoundData.modelABrokePledge}
            />
          </div>
          
          <div className="text-center px-6 py-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Points</p>
            <p className="text-lg font-bold font-mono">
              +{currentRoundData.modelAPayoff} / +{currentRoundData.modelBPayoff}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {match.modelB.displayName}
            </p>
            <DecisionBadge
              decision={currentRoundData.modelBDecision}
              broke={currentRoundData.modelBBrokePledge}
            />
          </div>
        </div>

        {/* Reasoning Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Internal Reasoning</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {match.modelA.displayName}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentRoundData.modelAReason || "No reasoning provided"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {match.modelB.displayName}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentRoundData.modelBReason || "No reasoning provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown / Controls for Live Mode */}
        {mode === "live" && isLatestRound && isWaitingForNextRound && !isMatchComplete && (
          <div className="border-t pt-4 space-y-3">
            {isPaused ? (
              <div className="flex flex-col items-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Pause className="h-4 w-4 mr-2" />
                  Paused — Take your time to review
                </Badge>
                <Button onClick={onPauseToggle} className="w-48">
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Next round in {countdownSeconds}s
                  </span>
                  <Button variant="outline" size="sm" onClick={onPauseToggle}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause to review
                  </Button>
                </div>
                <Progress value={countdownProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Match Complete Status */}
        {isMatchComplete && mode === "live" && isLatestRound && (
          <div className="border-t pt-4">
            <div className="p-4 rounded-lg bg-primary/10 text-center space-y-3">
              <p className="font-semibold">Match Complete!</p>
              <p className="text-sm text-muted-foreground">
                Final Score: {match.modelA.displayName} {scoreA} - {scoreB} {match.modelB.displayName}
              </p>
              {onContinue && (
                <Button onClick={onContinue} className="mt-2">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

