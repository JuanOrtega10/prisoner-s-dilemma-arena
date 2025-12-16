"use client"

import { useGame } from "@/lib/game-context"
import { TournamentSummary } from "./tournament-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft, Calendar } from "lucide-react"
import type { ModelStats } from "@/lib/types"

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

        {/* Match Details (using TournamentSummary in read-only mode) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Expand each match to see round-by-round results</CardDescription>
          </CardHeader>
          <CardContent>
            <TournamentSummary isReadOnly pastTournament={viewingTournament} />
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
