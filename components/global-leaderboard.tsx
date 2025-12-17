"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { GlobalLeaderboardEntry } from "@/lib/types"
import { Trophy, Medal, Award } from "lucide-react"

export function GlobalLeaderboard() {
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("global_leaderboard")
        .select("*")
        .order("win_rate", { ascending: false })

      if (!error && data) {
        setEntries(data)
      }
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Leaderboard</CardTitle>
        <CardDescription>Aggregated results across all tournaments stored in Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No tournament data yet.</p>
            <p className="text-sm text-muted-foreground">Complete a tournament to see global rankings.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right" title="Percentage of matches won against opponents">
                  Win Rate
                </TableHead>
                <TableHead className="text-right" title="Average points earned per match (max 25 pts)">
                  Pts/Match
                </TableHead>
                <TableHead className="text-right" title="How often the model kept its promises - said it would cooperate and actually did">
                  Honesty
                </TableHead>
                <TableHead className="text-right" title="How often the model chose to cooperate instead of defect">
                  Cooperation
                </TableHead>
                <TableHead className="text-right" title="Total number of tournaments played">
                  Tournaments
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className="font-medium">{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.model_display_name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-mono">
                      {Number(entry.win_rate || 0).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-muted-foreground">
                      {Number(entry.average_points_per_match || 0).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        Number(entry.average_honesty_percent) >= 70 ? "text-emerald-600" : "text-muted-foreground"
                      }
                    >
                      {Number(entry.average_honesty_percent).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        Number(entry.average_cooperation_percent) >= 50 ? "text-emerald-600" : "text-muted-foreground"
                      }
                    >
                      {Number(entry.average_cooperation_percent).toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{entry.total_tournaments_played}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
