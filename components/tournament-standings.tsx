"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ModelStats } from "@/lib/types"
import { TrendingUp } from "lucide-react"

interface TournamentStandingsProps {
  modelStats: Record<string, ModelStats>
}

export function TournamentStandings({ modelStats }: TournamentStandingsProps) {
  const sortedStats = Object.values(modelStats).sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Tournament Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Honesty</TableHead>
              <TableHead className="text-right">Coop</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((stats, index) => (
              <TableRow key={stats.model.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium w-4">{index + 1}.</span>
                    <span className="font-medium text-sm">{stats.model.displayName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="font-mono">
                    {stats.totalPoints}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`text-sm ${stats.honestyPercent >= 70 ? "text-emerald-600" : stats.honestyPercent >= 40 ? "text-amber-600" : "text-red-600"}`}
                  >
                    {stats.honestyPercent.toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`text-sm ${stats.cooperationPercent >= 50 ? "text-emerald-600" : "text-muted-foreground"}`}
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
  )
}
