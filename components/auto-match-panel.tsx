"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { MatchState, Decision } from "@/lib/types"
import { Swords, AlertTriangle, Loader2 } from "lucide-react"

interface AutoMatchPanelProps {
  match: MatchState
  isPaused: boolean
}

export function AutoMatchPanel({ match, isPaused }: AutoMatchPanelProps) {
  const lastRound = match.rounds[match.rounds.length - 1]
  const isMatchOver = match.currentRound > match.maxRounds

  const DecisionBadge = ({ decision, broke }: { decision: Decision; broke?: boolean }) => (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-background ${
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

  // Calculate current scores for this match
  const scoreA = match.rounds.reduce((sum, r) => sum + r.modelAPayoff, 0)
  const scoreB = match.rounds.reduce((sum, r) => sum + r.modelBPayoff, 0)

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            {match.modelA.displayName} vs {match.modelB.displayName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isPaused && !isMatchOver && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Auto-playing
              </Badge>
            )}
            <Badge variant="outline">
              Round {Math.min(match.currentRound, match.maxRounds)} of {match.maxRounds}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">Current match score</p>
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

      <CardContent className="space-y-4">
        {/* Latest Round Result (animated) */}
        {lastRound && (
          <div className="p-4 rounded-lg bg-muted/50 border animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Round {lastRound.round} Result</p>
              <p className="text-xs text-muted-foreground font-mono">
                +{lastRound.modelAPayoff} / +{lastRound.modelBPayoff}
              </p>
            </div>

            {/* Pledges */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-background border min-h-[80px]">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{match.modelA.displayName}'s pledge</p>
                <p className="text-sm italic leading-relaxed line-clamp-4" title={lastRound.modelAPledge}>
                  "{lastRound.modelAPledge}"
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background border min-h-[80px]">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{match.modelB.displayName}'s pledge</p>
                <p className="text-sm italic leading-relaxed line-clamp-4" title={lastRound.modelBPledge}>
                  "{lastRound.modelBPledge}"
                </p>
              </div>
            </div>

            {/* Decisions */}
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">{match.modelA.displayName}</p>
                <DecisionBadge decision={lastRound.modelADecision} broke={lastRound.modelABrokePledge} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-2">{match.modelB.displayName}</p>
                <DecisionBadge decision={lastRound.modelBDecision} broke={lastRound.modelBBrokePledge} />
              </div>
            </div>

            {/* Reasoning */}
            {(lastRound.modelAReason || lastRound.modelBReason) && (
              <div className="mt-4 pt-3 border-t space-y-1 text-xs text-muted-foreground">
                {lastRound.modelAReason && (
                  <p>
                    <span className="font-medium text-foreground">{match.modelA.displayName}:</span>{" "}
                    {lastRound.modelAReason}
                  </p>
                )}
                {lastRound.modelBReason && (
                  <p>
                    <span className="font-medium text-foreground">{match.modelB.displayName}:</span>{" "}
                    {lastRound.modelBReason}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Match History Table */}
        {match.rounds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Match History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Round</TableHead>
                  <TableHead>{match.modelA.displayName}</TableHead>
                  <TableHead>{match.modelB.displayName}</TableHead>
                  <TableHead className="text-right">Points</TableHead>
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

        {/* Match Complete Status */}
        {isMatchOver && (
          <div className="p-4 rounded-lg bg-primary/10 text-center">
            <p className="font-medium">Match Complete</p>
            <p className="text-sm text-muted-foreground mt-1">
              Final Score: {match.modelA.displayName} {scoreA} - {scoreB} {match.modelB.displayName}
            </p>
          </div>
        )}

        {/* Waiting indicator when no rounds yet */}
        {match.rounds.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Starting match...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
