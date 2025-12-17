"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GlobalLeaderboard } from "./global-leaderboard"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  Trophy,
  Medal,
  Award,
  ShieldCheck,
  Handshake,
  Target,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react"

export function FinalRanking() {
  const { tournament, resetTournament, setCurrentView } = useGame()
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false)
  const [savedToLeaderboard, setSavedToLeaderboard] = useState(false)

  useEffect(() => {
    async function saveResults() {
      if (!tournament || savedToLeaderboard) return

      const supabase = getSupabaseBrowserClient()

      // Calculate matches played and won for each model
      const matchStats: Record<string, { played: number; won: number }> = {}
      
      // Initialize match stats for all models
      for (const model of tournament.models) {
        matchStats[model.id] = { played: 0, won: 0 }
      }
      
      // Count matches played and won from completed matches
      for (const match of tournament.matches) {
        if (!match.isComplete) continue
        
        // Calculate total points for each model in this match
        const pointsA = match.rounds.reduce((sum, r) => sum + r.modelAPayoff, 0)
        const pointsB = match.rounds.reduce((sum, r) => sum + r.modelBPayoff, 0)
        
        // Both models played this match
        matchStats[match.modelA.id].played += 1
        matchStats[match.modelB.id].played += 1
        
        // Determine winner (ties don't count as wins for either)
        if (pointsA > pointsB) {
          matchStats[match.modelA.id].won += 1
        } else if (pointsB > pointsA) {
          matchStats[match.modelB.id].won += 1
        }
      }

      // Save each model's stats to the global leaderboard
      for (const stats of Object.values(tournament.modelStats)) {
        const modelMatchStats = matchStats[stats.model.id]
        
        const { data: existing } = await supabase
          .from("global_leaderboard")
          .select("*")
          .eq("model_id", stats.model.id)
          .single()

        if (existing) {
          // Update existing entry
          await supabase
            .from("global_leaderboard")
            .update({
              total_tournaments_played: existing.total_tournaments_played + 1,
              total_points_sum: existing.total_points_sum + stats.totalPoints,
              total_honesty_sum: Number(existing.total_honesty_sum) + stats.honestyPercent,
              total_cooperation_sum: Number(existing.total_cooperation_sum) + stats.cooperationPercent,
              total_matches_played: (existing.total_matches_played || 0) + modelMatchStats.played,
              total_matches_won: (existing.total_matches_won || 0) + modelMatchStats.won,
              last_played_at: new Date().toISOString(),
            })
            .eq("model_id", stats.model.id)
        } else {
          // Insert new entry
          await supabase.from("global_leaderboard").insert({
            model_id: stats.model.id,
            model_display_name: stats.model.displayName,
            total_tournaments_played: 1,
            total_points_sum: stats.totalPoints,
            total_honesty_sum: stats.honestyPercent,
            total_cooperation_sum: stats.cooperationPercent,
            total_matches_played: modelMatchStats.played,
            total_matches_won: modelMatchStats.won,
          })
        }
      }

      const sortedStats = Object.values(tournament.modelStats).sort((a, b) => b.totalPoints - a.totalPoints)
      const winner = sortedStats[0]
      const avgHonesty = sortedStats.reduce((sum, s) => sum + s.honestyPercent, 0) / sortedStats.length
      const avgCooperation = sortedStats.reduce((sum, s) => sum + s.cooperationPercent, 0) / sortedStats.length

      await supabase.from("recent_tournaments").insert({
        models: tournament.models,
        matches: tournament.matches,
        final_rankings: sortedStats,
        winner_model_id: winner.model.id,
        winner_model_name: winner.model.displayName,
        avg_honesty_percent: avgHonesty,
        avg_cooperation_percent: avgCooperation,
        total_models: tournament.models.length,
      })

      setSavedToLeaderboard(true)
    }

    saveResults()
  }, [tournament, savedToLeaderboard])

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No tournament results available</p>
      </div>
    )
  }

  const sortedStats = Object.values(tournament.modelStats).sort((a, b) => b.totalPoints - a.totalPoints)
  const winner = sortedStats[0]

  // Calculate awards
  const mostHonest = [...sortedStats].sort((a, b) => b.honestyPercent - a.honestyPercent)[0]
  const mostCooperative = [...sortedStats].sort((a, b) => b.cooperationPercent - a.cooperationPercent)[0]
  const mostOpportunistic = [...sortedStats].sort((a, b) => b.opportunisticGains - a.opportunisticGains)[0]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("summary")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summary
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Tournament Results</h1>
          <p className="text-xl text-muted-foreground">Who won, who cooperated, and who kept their word?</p>
        </div>

        {/* Winner Card */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Winner</p>
              <h2 className="text-3xl font-bold mb-2">{winner.model.displayName}</h2>
              <p className="text-lg text-muted-foreground">
                Total payoff: <span className="font-bold text-foreground">{winner.totalPoints} points</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {winner.honestyPercent >= 70
                  ? "Won through consistent cooperation and trustworthy behavior."
                  : winner.cooperationPercent >= 50
                    ? "Balanced cooperation with strategic defection."
                    : "Dominated through strategic play and exploiting opportunities."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Model Rankings</CardTitle>
            <CardDescription>Final standings sorted by total points</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Total Points</TableHead>
                  <TableHead className="text-right">Honesty</TableHead>
                  <TableHead className="text-right">Cooperation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.map((stats, index) => (
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
                      <span className="text-xs text-muted-foreground ml-1">
                        ({stats.promisesKept}/{stats.promisesMade})
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

        {/* Behavioral Awards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Most Honest Model</p>
                <p className="font-bold">{mostHonest.model.displayName}</p>
                <p className="text-sm text-emerald-600">{mostHonest.honestyPercent.toFixed(0)}% honesty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Handshake className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Most Cooperative Model</p>
                <p className="font-bold">{mostCooperative.model.displayName}</p>
                <p className="text-sm text-blue-600">{mostCooperative.cooperationPercent.toFixed(0)}% cooperation</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Most Opportunistic Model</p>
                <p className="font-bold">{mostOpportunistic.model.displayName}</p>
                <p className="text-sm text-red-600">{mostOpportunistic.opportunisticGains} pts from exploitation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Leaderboard Toggle */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setShowGlobalLeaderboard(!showGlobalLeaderboard)}
          >
            {showGlobalLeaderboard ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Global Leaderboard
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Global Leaderboard
              </>
            )}
          </Button>
        </div>

        {showGlobalLeaderboard && <GlobalLeaderboard />}

        {/* Play Again Button */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={resetTournament}>
            <RotateCcw className="h-5 w-5 mr-2" />
            Start New Tournament
          </Button>
        </div>
      </div>
    </div>
  )
}
