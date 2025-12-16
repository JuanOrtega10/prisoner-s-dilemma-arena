"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MatchState, Decision } from "@/lib/types"
import { useGame } from "@/lib/game-context"
import { Swords, MessageSquare, Loader2, AlertTriangle, ChevronRight, Sparkles } from "lucide-react"

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
      // Build history for each model
      const historyForA = match.rounds.map((r) => ({
        round: r.round,
        yourMove: r.modelADecision,
        opponentMove: r.modelBDecision,
      }))

      const historyForB = match.rounds.map((r) => ({
        round: r.round,
        yourMove: r.modelBDecision,
        opponentMove: r.modelADecision,
      }))

      // Call both models in parallel via AI Gateway
      const [responseA, responseB] = await Promise.all([
        fetch("/api/play-round", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelA.id,
            opponentId: match.modelB.displayName,
            roundNumber: match.currentRound,
            history: historyForA,
          }),
        }).then((r) => r.json()),
        fetch("/api/play-round", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: match.modelB.id,
            opponentId: match.modelA.displayName,
            roundNumber: match.currentRound,
            history: historyForB,
          }),
        }).then((r) => r.json()),
      ])

      // Show pledges first
      setCurrentRoundState({
        modelAPledge: responseA.pledge,
        modelBPledge: responseB.pledge,
      })
      setPhase("showing-pledges")

      // Wait for dramatic effect
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show decisions
      setCurrentRoundState((prev) => ({
        ...prev,
        modelADecision: responseA.decision,
        modelBDecision: responseB.decision,
        modelAReason: responseA.reason,
        modelBReason: responseB.reason,
      }))
      setPhase("showing-results")

      // Record the round
      playRound(
        responseA.pledge,
        responseA.decision,
        responseA.reason,
        responseB.pledge,
        responseB.decision,
        responseB.reason,
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
          <div className="space-y-4 pt-4 border-t">
            {/* Pledges */}
            {(phase === "generating-pledges" ||
              phase === "showing-pledges" ||
              phase === "generating-actions" ||
              phase === "showing-results") && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Public Pledges
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{match.modelA.displayName}</p>
                    {phase === "generating-pledges" ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating pledge...
                      </div>
                    ) : (
                      <p className="text-sm italic">"{currentRoundState.modelAPledge}"</p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{match.modelB.displayName}</p>
                    {phase === "generating-pledges" ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating pledge...
                      </div>
                    ) : (
                      <p className="text-sm italic">"{currentRoundState.modelBPledge}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions & Results */}
            {phase === "showing-results" && currentRoundState.modelADecision && currentRoundState.modelBDecision && (
              <>
                <div className="flex justify-center gap-12 py-4">
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{match.modelA.displayName}</p>
                    <DecisionBadge
                      decision={currentRoundState.modelADecision}
                      broke={
                        currentRoundState.modelAPledge?.toLowerCase().includes("cooperate") &&
                        currentRoundState.modelADecision === "D"
                      }
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{match.modelB.displayName}</p>
                    <DecisionBadge
                      decision={currentRoundState.modelBDecision}
                      broke={
                        currentRoundState.modelBPledge?.toLowerCase().includes("cooperate") &&
                        currentRoundState.modelBDecision === "D"
                      }
                    />
                  </div>
                </div>

                {/* Reasoning */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Why They Played This Way
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{match.modelA.displayName}:</span>{" "}
                      {currentRoundState.modelAReason}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{match.modelB.displayName}:</span>{" "}
                      {currentRoundState.modelBReason}
                    </p>
                  </div>
                </div>
              </>
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
            <Button onClick={handlePlayRound} className="w-full" size="lg">
              <Swords className="h-5 w-5 mr-2" />
              Play Round {match.currentRound}
            </Button>
          )}

          {phase === "showing-results" && !isMatchOver && (
            <Button onClick={handleNextRound} className="w-full" size="lg">
              Next Round
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}

          {phase === "showing-results" && isMatchOver && (
            <Button onClick={handleNextMatch} className="w-full" size="lg">
              {match.isComplete ? "Next Match" : "Show Final Ranking"}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}

          {(phase === "generating-pledges" || phase === "showing-pledges" || phase === "generating-actions") && (
            <Button disabled className="w-full" size="lg">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing via AI Gateway...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
