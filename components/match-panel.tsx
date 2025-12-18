"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MatchState, Decision } from "@/lib/types"
import { useGame } from "@/lib/game-context"
import { Swords, MessageSquare, Loader2, AlertTriangle, ChevronRight, Sparkles, Brain, CheckCircle2, Circle } from "lucide-react"

interface MatchPanelProps {
  match: MatchState
  onMatchComplete: () => void
}

type RoundPhase = "idle" | "generating-pledges" | "showing-pledges" | "generating-actions" | "showing-results"

interface CurrentRoundState {
  modelAPledge?: string
  modelBPledge?: string
  modelADecision?: Decision
  modelBDecision?: Decision
  modelAReason?: string
  modelBReason?: string
  modelABrokePledge?: boolean
  modelBBrokePledge?: boolean
}

// Phase Timeline Component
function PhaseTimeline({ currentPhase }: { currentPhase: RoundPhase }) {
  const phases = [
    { id: "generating-pledges", label: "Generating Pledges", icon: MessageSquare },
    { id: "showing-pledges", label: "Exchanging Pledges", icon: MessageSquare },
    { id: "generating-actions", label: "Deciding Actions", icon: Brain },
    { id: "showing-results", label: "Results", icon: Sparkles },
  ]

  const getPhaseIndex = (phase: RoundPhase) => {
    if (phase === "idle") return -1
    return phases.findIndex((p) => p.id === phase)
  }

  const currentIndex = getPhaseIndex(currentPhase)

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {phases.map((phase, index) => {
        const isActive = index === currentIndex
        const isComplete = index < currentIndex
        const Icon = phase.icon

        return (
          <div key={phase.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${isComplete ? "bg-emerald-500 text-white" : ""}
                  ${isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse" : ""}
                  ${!isComplete && !isActive ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isActive ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 text-center max-w-[80px] transition-colors duration-300
                  ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}
                `}
              >
                {phase.label}
              </span>
            </div>
            {index < phases.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 transition-colors duration-500
                  ${index < currentIndex ? "bg-emerald-500" : "bg-muted"}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Skeleton Loader for Pledges
function PledgeSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
      <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
    </div>
  )
}

// Typing Animation Component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
    </div>
  )
}

// Decision Skeleton
function DecisionSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-muted-foreground/20" />
      <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
    </div>
  )
}

// Reasoning Skeleton
function ReasoningSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 bg-muted-foreground/20 rounded w-full" />
      <div className="h-3 bg-muted-foreground/20 rounded w-5/6" />
      <div className="h-3 bg-muted-foreground/20 rounded w-4/6" />
    </div>
  )
}

export function MatchPanel({ match, onMatchComplete }: MatchPanelProps) {
  const { playRound } = useGame()
  const [phase, setPhase] = useState<RoundPhase>("idle")
  const [currentRoundState, setCurrentRoundState] = useState<CurrentRoundState>({})
  const [error, setError] = useState<string | null>(null)

  const handlePlayRound = async () => {
    setError(null)
    setPhase("generating-pledges")

    try {
      // Build history for each model (including pledges)
      const historyForA = match.rounds.map((r) => ({
        round: r.round,
        yourPledge: r.modelAPledge,
        opponentPledge: r.modelBPledge,
        yourMove: r.modelADecision,
        opponentMove: r.modelBDecision,
      }))

      const historyForB = match.rounds.map((r) => ({
        round: r.round,
        yourPledge: r.modelBPledge,
        opponentPledge: r.modelAPledge,
        yourMove: r.modelBDecision,
        opponentMove: r.modelADecision,
      }))

      // PHASE 1: Generate pledges from both models in parallel
      const [pledgeA, pledgeB] = await Promise.all([
        fetch("/api/generate-pledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelA.id,
            opponentId: match.modelB.displayName,
            roundNumber: match.currentRound,
            maxRounds: match.maxRounds,
            history: historyForA,
          }),
        }).then((r) => r.json()),
        fetch("/api/generate-pledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelB.id,
            opponentId: match.modelA.displayName,
            roundNumber: match.currentRound,
            maxRounds: match.maxRounds,
            history: historyForB,
          }),
        }).then((r) => r.json()),
      ])

      // Show pledges
      setCurrentRoundState({
        modelAPledge: pledgeA.pledge,
        modelBPledge: pledgeB.pledge,
      })
      setPhase("showing-pledges")

      // Wait for user to see pledges
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // PHASE 2: Generate decisions (each model sees opponent's pledge)
      setPhase("generating-actions")

      const [decisionA, decisionB] = await Promise.all([
        fetch("/api/play-round", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelA.id,
            opponentId: match.modelB.displayName,
            roundNumber: match.currentRound,
            maxRounds: match.maxRounds,
            history: historyForA,
            yourPledge: pledgeA.pledge,
            opponentPledge: pledgeB.pledge,
          }),
        }).then((r) => r.json()),
        fetch("/api/play-round", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelB.id,
            opponentId: match.modelA.displayName,
            roundNumber: match.currentRound,
            maxRounds: match.maxRounds,
            history: historyForB,
            yourPledge: pledgeB.pledge,
            opponentPledge: pledgeA.pledge,
          }),
        }).then((r) => r.json()),
      ])

      // Show decisions
      setCurrentRoundState((prev) => ({
        ...prev,
        modelADecision: decisionA.decision,
        modelBDecision: decisionB.decision,
        modelAReason: decisionA.reason,
        modelBReason: decisionB.reason,
        modelABrokePledge: decisionA.brokePledge ?? false,
        modelBBrokePledge: decisionB.brokePledge ?? false,
      }))
      setPhase("showing-results")

      // Record the round
      playRound(
        pledgeA.pledge,
        decisionA.decision,
        decisionA.reason,
        decisionA.brokePledge ?? false,
        pledgeB.pledge,
        decisionB.decision,
        decisionB.reason,
        decisionB.brokePledge ?? false,
      )
    } catch (err) {
      setError("Failed to get responses from models. Please try again.")
      setPhase("idle")
    }
  }

  const handleNextRound = () => {
    setCurrentRoundState({})
    setPhase("idle")
  }

  const handleNextMatch = () => {
    setCurrentRoundState({})
    setPhase("idle")
    onMatchComplete()
  }

  const DecisionBadge = ({ decision, broke }: { decision: Decision; broke?: boolean }) => (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background ${
          decision === "C" ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        {decision}
      </div>
      <span className="text-xs text-muted-foreground">{decision === "C" ? "Cooperate" : "Defect"}</span>
      {broke && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Broke pledge
        </Badge>
      )}
    </div>
  )

  const isMatchOver = match.currentRound > match.maxRounds

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            {match.modelA.displayName} vs {match.modelB.displayName}
          </CardTitle>
          <Badge variant="outline">
            Round {Math.min(match.currentRound, match.maxRounds)} of {match.maxRounds}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Standard Prisoner's Dilemma payoff matrix via AI Gateway</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match History */}
        {match.rounds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Match History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Round</TableHead>
                  <TableHead>{match.modelA.displayName}</TableHead>
                  <TableHead>{match.modelB.displayName}</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {match.rounds.map((round) => (
                  <TableRow key={round.round}>
                    <TableCell className="font-mono">{round.round}</TableCell>
                    <TableCell>
                      <Badge variant={round.modelADecision === "C" ? "default" : "destructive"} className="font-mono">
                        {round.modelADecision}
                      </Badge>
                      {round.modelABrokePledge && (
                        <AlertTriangle className="inline h-3 w-3 ml-1 text-amber-500" title="Broke pledge" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={round.modelBDecision === "C" ? "default" : "destructive"} className="font-mono">
                        {round.modelBDecision}
                      </Badge>
                      {round.modelBBrokePledge && (
                        <AlertTriangle className="inline h-3 w-3 ml-1 text-amber-500" title="Broke pledge" />
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      +{round.modelAPayoff} / +{round.modelBPayoff}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Current Round Display */}
        {phase !== "idle" && (
          <div className="space-y-6 pt-4 border-t">
            {/* Phase Timeline */}
            <PhaseTimeline currentPhase={phase} />

            {/* Phase 1: Pledges Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${phase === "generating-pledges" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold">Phase 1: Public Pledges</h4>
                {(phase === "showing-pledges" || phase === "generating-actions" || phase === "showing-results") && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Model A Pledge */}
                <div className={`
                  relative p-4 rounded-lg border-2 transition-all duration-500
                  ${phase === "generating-pledges" ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted"}
                `}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {match.modelA.displayName}
                    </p>
                  </div>
                  {phase === "generating-pledges" ? (
                    <div className="space-y-2">
                      <TypingIndicator />
                      <PledgeSkeleton />
                    </div>
                  ) : (
                    <p className={`
                      text-sm leading-relaxed transition-all duration-500
                      ${phase === "showing-pledges" ? "animate-fade-in" : ""}
                    `}>
                      <span className="text-muted-foreground">"</span>
                      <span className="italic">{currentRoundState.modelAPledge}</span>
                      <span className="text-muted-foreground">"</span>
                    </p>
                  )}
                </div>

                {/* Model B Pledge */}
                <div className={`
                  relative p-4 rounded-lg border-2 transition-all duration-500
                  ${phase === "generating-pledges" ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted"}
                `}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {match.modelB.displayName}
                    </p>
                  </div>
                  {phase === "generating-pledges" ? (
                    <div className="space-y-2">
                      <TypingIndicator />
                      <PledgeSkeleton />
                    </div>
                  ) : (
                    <p className={`
                      text-sm leading-relaxed transition-all duration-500
                      ${phase === "showing-pledges" ? "animate-fade-in" : ""}
                    `}>
                      <span className="text-muted-foreground">"</span>
                      <span className="italic">{currentRoundState.modelBPledge}</span>
                      <span className="text-muted-foreground">"</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phase 2: Decisions Section */}
            {(phase === "generating-actions" || phase === "showing-results") && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${phase === "generating-actions" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Brain className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold">Phase 2: Strategic Decisions</h4>
                  {phase === "showing-results" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                  )}
                </div>

                {/* Decisions Display */}
                <div className={`
                  p-6 rounded-lg border-2 transition-all duration-500
                  ${phase === "generating-actions" ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted/50"}
                `}>
                  <div className="flex justify-center gap-16">
                    {/* Model A Decision */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {match.modelA.displayName}
                        </p>
                      </div>
                      {phase === "generating-actions" ? (
                        <div className="space-y-3">
                          <DecisionSkeleton />
                          <div className="pt-2">
                            <TypingIndicator />
                          </div>
                        </div>
                      ) : (
                        <div className="animate-scale-in">
                          <DecisionBadge
                            decision={currentRoundState.modelADecision!}
                            broke={currentRoundState.modelABrokePledge}
                          />
                        </div>
                      )}
                    </div>

                    {/* VS Divider */}
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-muted-foreground/30">VS</div>
                    </div>

                    {/* Model B Decision */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {match.modelB.displayName}
                        </p>
                      </div>
                      {phase === "generating-actions" ? (
                        <div className="space-y-3">
                          <DecisionSkeleton />
                          <div className="pt-2">
                            <TypingIndicator />
                          </div>
                        </div>
                      ) : (
                        <div className="animate-scale-in">
                          <DecisionBadge
                            decision={currentRoundState.modelBDecision!}
                            broke={currentRoundState.modelBBrokePledge}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Internal Reasoning */}
                {(phase === "generating-actions" || phase === "showing-results") && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md ${phase === "generating-actions" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-semibold">Internal Reasoning</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Model A Reasoning */}
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <p className="text-xs font-semibold text-muted-foreground">{match.modelA.displayName}</p>
                        </div>
                        {phase === "generating-actions" ? (
                          <ReasoningSkeleton />
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed animate-fade-in">
                            {currentRoundState.modelAReason}
                          </p>
                        )}
                      </div>

                      {/* Model B Reasoning */}
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <p className="text-xs font-semibold text-muted-foreground">{match.modelB.displayName}</p>
                        </div>
                        {phase === "generating-actions" ? (
                          <ReasoningSkeleton />
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed animate-fade-in">
                            {currentRoundState.modelBReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          {phase === "idle" && !isMatchOver && (
            <Button onClick={handlePlayRound} className="w-full group" size="lg">
              <Swords className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Play Round {match.currentRound}
            </Button>
          )}

          {phase === "showing-results" && !isMatchOver && (
            <Button onClick={handleNextRound} className="w-full group" size="lg">
              Next Round
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {phase === "showing-results" && isMatchOver && (
            <Button onClick={handleNextMatch} className="w-full group" size="lg">
              {match.isComplete ? "Next Match" : "Show Final Ranking"}
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {phase === "generating-pledges" && (
            <Button disabled className="w-full relative overflow-hidden" size="lg">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <MessageSquare className="h-5 w-5 mr-2 animate-pulse" />
              <span className="relative">Phase 1: Generating pledges...</span>
            </Button>
          )}

          {phase === "showing-pledges" && (
            <Button disabled className="w-full" size="lg">
              <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-400" />
              Pledges exchanged — preparing decisions...
            </Button>
          )}

          {phase === "generating-actions" && (
            <Button disabled className="w-full relative overflow-hidden" size="lg">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <Brain className="h-5 w-5 mr-2 animate-pulse" />
              <span className="relative">Phase 2: Models deciding...</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
