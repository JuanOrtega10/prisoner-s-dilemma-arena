"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RoundDetailViewer } from "./round-detail-viewer"
import { Trophy, Medal, Award, ArrowLeft, Calendar, ChevronDown, ChevronUp, Swords, Eye } from "lucide-react"
import type { ModelStats, MatchState } from "@/lib/types"

function MatchDetailCard({ match, matchIndex }: { match: MatchState; matchIndex: number }) {
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

export function HistoryDetail() {
  const { viewingTournament, setCurrentView } = useGame()

  if (!viewingTournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No tournament selected</p>
      </div>
    )
  }

  const rankings = viewingTournament.final_rankings as ModelStats[]
  const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints)
  const matches = viewingTournament.matches || []

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("history")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        </div>

        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Past Tournament (read-only)
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tournament Results</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(viewingTournament.created_at)}
          </p>
        </div>

        {/* Winner Card */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Winner</p>
              <h2 className="text-2xl font-bold">{viewingTournament.winner_model_name}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Rankings Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Final Rankings</CardTitle>
            <CardDescription>{viewingTournament.total_models} models competed</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Honesty</TableHead>
                  <TableHead className="text-right">Cooperation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRankings.map((stats, index) => (
                  <TableRow key={stats.model.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{stats.model.displayName}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {stats.totalPoints}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          stats.honestyPercent >= 70
                            ? "text-emerald-600"
                            : stats.honestyPercent >= 40
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {stats.honestyPercent.toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${stats.cooperationPercent >= 50 ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        {stats.cooperationPercent.toFixed(0)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Match Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Expand each match to see round-by-round results with full details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.map((match, index) => (
              <MatchDetailCard key={index} match={match} matchIndex={index} />
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView("history")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          <Button onClick={() => setCurrentView("home")}>Start New Tournament</Button>
        </div>
      </div>
    </div>
  )
}
