"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RoundDetailViewer } from "./round-detail-viewer"
import { ChevronDown, ChevronUp, Trophy, Home, ArrowRight, Handshake, Swords, Eye, ArrowLeft } from "lucide-react"
import type { MatchState, RecentTournament } from "@/lib/types"

interface TournamentSummaryProps {
  isReadOnly?: boolean
  pastTournament?: RecentTournament
}

function MatchCard({ match, matchIndex }: { match: MatchState; matchIndex: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "detail">("table")
  const [selectedRound, setSelectedRound] = useState(1)

  const totalA = match.rounds.reduce((sum, r) => sum + r.modelAPayoff, 0)
  const totalB = match.rounds.reduce((sum, r) => sum + r.modelBPayoff, 0)
  const winner = totalA > totalB ? match.modelA : totalB > totalA ? match.modelB : null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Match {matchIndex + 1}</span>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className={winner?.id === match.modelA.id ? "text-emerald-600" : ""}>
                    {match.modelA.displayName}
                  </span>
                  <Swords className="h-4 w-4 text-muted-foreground" />
                  <span className={winner?.id === match.modelB.id ? "text-emerald-600" : ""}>
                    {match.modelB.displayName}
                  </span>
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-mono">
                  <span className={totalA > totalB ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                    {totalA}
                  </span>
                  <span className="text-muted-foreground mx-1">-</span>
                  <span className={totalB > totalA ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                    {totalB}
                  </span>
                </div>
                {winner && (
                  <Badge variant="secondary" className="text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    {winner.displayName}
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Quick View
                </Button>
                <Button
                  variant={viewMode === "detail" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("detail")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detailed View
                </Button>
              </div>
              {viewMode === "detail" && (
                <div className="flex items-center gap-2">
                  {match.rounds.map((_, idx) => (
                    <Button
                      key={idx}
                      variant={selectedRound === idx + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setSelectedRound(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {viewMode === "table" ? (
              /* Quick Table View */
              <div>
                <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-2 text-xs font-medium text-muted-foreground pb-2 border-b mb-2">
                  <span className="w-8"></span>
                  <span>{match.modelA.displayName} Pledge</span>
                  <span className="w-8 text-center">A</span>
                  <span className="w-8 text-center">B</span>
                  <span>{match.modelB.displayName} Pledge</span>
                  <span className="w-16 text-right">Payoff</span>
                </div>
                {match.rounds.map((round) => (
                  <div
                    key={round.round}
                    className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] gap-2 items-center text-sm py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedRound(round.round)
                      setViewMode("detail")
                    }}
                  >
                    <span className="text-muted-foreground w-8">R{round.round}</span>
                    <span className="text-xs text-muted-foreground truncate" title={round.modelAPledge}>
                      "{round.modelAPledge.length > 30 ? round.modelAPledge.substring(0, 30) + "..." : round.modelAPledge}"
                    </span>
                    <Badge
                      variant={round.modelADecision === "C" ? "default" : "destructive"}
                      className={`w-8 justify-center ${round.modelADecision === "C" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                    >
                      {round.modelADecision}
                    </Badge>
                    <Badge
                      variant={round.modelBDecision === "C" ? "default" : "destructive"}
                      className={`w-8 justify-center ${round.modelBDecision === "C" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                    >
                      {round.modelBDecision}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate" title={round.modelBPledge}>
                      "{round.modelBPledge.length > 30 ? round.modelBPledge.substring(0, 30) + "..." : round.modelBPledge}"
                    </span>
                    <span className="text-xs font-mono w-16 text-right">
                      <span className={round.modelAPayoff >= round.modelBPayoff ? "text-emerald-600 font-medium" : ""}>
                        +{round.modelAPayoff}
                      </span>
                      {" / "}
                      <span className={round.modelBPayoff >= round.modelAPayoff ? "text-emerald-600 font-medium" : ""}>
                        +{round.modelBPayoff}
                      </span>
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Click on any round to see full details
                </p>
              </div>
            ) : (
              /* Detailed Round View */
              <RoundDetailViewer
                match={match}
                mode="review"
                selectedRound={selectedRound}
                onRoundChange={setSelectedRound}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function TournamentSummary({ isReadOnly = false, pastTournament }: TournamentSummaryProps) {
  const { tournament, currentView, setCurrentView, resetTournament } = useGame()

  const activeTournament = pastTournament || tournament
  const matches = activeTournament?.matches || []
  const isMatchReview = currentView === "matchReview"

  if (!activeTournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No tournament data available</p>
      </div>
    )
  }

  // Calculate summary stats
  const totalRounds = matches.reduce((sum, m) => sum + m.rounds.length, 0)
  const totalCooperations = matches.reduce(
    (sum, m) =>
      sum +
      m.rounds.filter((r) => r.modelADecision === "C").length +
      m.rounds.filter((r) => r.modelBDecision === "C").length,
    0,
  )
  const cooperationRate = totalRounds > 0 ? ((totalCooperations / (totalRounds * 2)) * 100).toFixed(0) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Call to Action Banner for Match Review */}
        {isMatchReview && !isReadOnly && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-lg font-semibold mb-1">Tournament Complete!</h2>
                  <p className="text-sm text-muted-foreground">
                    Review all matches below, then proceed to see the final rankings
                  </p>
                </div>
                <Button onClick={() => setCurrentView("results")} size="lg" className="px-8 whitespace-nowrap">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Final Rankings
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          {isReadOnly && (
            <Badge variant="secondary" className="mb-4">
              Past Tournament (read-only)
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isMatchReview ? "Review All Matches" : "Tournament Summary"}
          </h1>
          <p className="text-muted-foreground">
            {matches.length} matches played · {totalRounds} total rounds · {cooperationRate}% cooperation rate
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{matches.length}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{totalRounds}</p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{totalCooperations}</p>
              <p className="text-xs text-muted-foreground">Cooperations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{cooperationRate}%</p>
              <p className="text-xs text-muted-foreground">Coop Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Match List */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            All Matches
          </h2>
          {matches.map((match, index) => (
            <MatchCard key={index} match={match} matchIndex={index} />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isReadOnly ? (
            <>
              <Button variant="outline" onClick={() => setCurrentView("history")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
              <Button onClick={() => setCurrentView("home")}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </>
          ) : isMatchReview ? (
            <>
              <Button variant="outline" onClick={resetTournament}>
                <Home className="h-4 w-4 mr-2" />
                Exit Tournament
              </Button>
              <Button onClick={() => setCurrentView("results")} size="lg" className="px-8">
                <Trophy className="h-4 w-4 mr-2" />
                View Final Rankings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetTournament}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button onClick={() => setCurrentView("results")} size="lg" className="px-8">
                View Final Rankings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
