"use client"

import { GameProvider, useGame } from "@/lib/game-context"
import { HomeView } from "@/components/home-view"
import { MatchViewer } from "@/components/match-viewer"
import { FinalRanking } from "@/components/final-ranking"
import { LearnPage } from "@/components/learn-page"
import { TournamentSummary } from "@/components/tournament-summary"
import { RecentGames } from "@/components/recent-games"
import { HistoryDetail } from "@/components/history-detail"

function GameContent() {
  const { currentView } = useGame()

  switch (currentView) {
    case "home":
      return <HomeView />
    case "match":
      return <MatchViewer />
    case "summary":
      return <TournamentSummary />
    case "results":
      return <FinalRanking />
    case "learn":
      return <LearnPage />
    case "history":
      return <RecentGames />
    case "historyDetail":
      return <HistoryDetail />
    default:
      return <HomeView />
  }
}

export default function Page() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
