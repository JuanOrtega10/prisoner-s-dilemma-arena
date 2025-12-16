"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Calendar, Users, ArrowLeft, ChevronRight, History } from "lucide-react"
import type { RecentTournament } from "@/lib/types"

export function RecentGames() {
  const { setCurrentView, setViewingTournament } = useGame()
  const [tournaments, setTournaments] = useState<RecentTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentTournaments() {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("recent_tournaments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching recent tournaments:", error)
      } else {
        setTournaments(data || [])
      }
      setIsLoading(false)
    }

    fetchRecentTournaments()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewTournament = (tournament: RecentTournament) => {
    setViewingTournament(tournament)
    setCurrentView("historyDetail")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
            <History className="h-4 w-4" />
            Tournament Archive
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Recent Games</h1>
          <p className="text-muted-foreground">Browse the last 10 tournaments and explore their results</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tournaments played yet</p>
                <Button onClick={() => setCurrentView("home")}>Start Your First Tournament</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewTournament(tournament)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tournament.winner_model_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tournament.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tournament.total_models} models
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <Badge variant="secondary" className="text-xs">
                          {tournament.avg_honesty_percent.toFixed(0)}% honest
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setCurrentView("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
