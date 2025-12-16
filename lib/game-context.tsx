"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { TournamentState, Model, RoundResult, RecentTournament } from "./types"
import { initializeTournament, calculatePayoffs, didBreakPledge, updateStats } from "./tournament"

type ViewType = "home" | "match" | "summary" | "results" | "learn" | "history" | "historyDetail" | "matchReview"

interface GameContextType {
  tournament: TournamentState | null
  startTournament: (models: Model[]) => void
  playRound: (
    modelAPledge: string,
    modelADecision: "C" | "D",
    modelAReason: string,
    modelBPledge: string,
    modelBDecision: "C" | "D",
    modelBReason: string,
  ) => void
  nextMatch: () => void
  resetTournament: () => void
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  viewingTournament: RecentTournament | null
  setViewingTournament: (tournament: RecentTournament | null) => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [tournament, setTournament] = useState<TournamentState | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [viewingTournament, setViewingTournament] = useState<RecentTournament | null>(null)

  const startTournament = (models: Model[]) => {
    const newTournament = initializeTournament(models)
    setTournament(newTournament)
    setCurrentView("match")
  }

  const playRound = (
    modelAPledge: string,
    modelADecision: "C" | "D",
    modelAReason: string,
    modelBPledge: string,
    modelBDecision: "C" | "D",
    modelBReason: string,
  ) => {
    if (!tournament) return

    const currentMatch = tournament.matches[tournament.currentMatchIndex]
    const [payoffA, payoffB] = calculatePayoffs(modelADecision, modelBDecision)

    const result: RoundResult = {
      round: currentMatch.currentRound,
      modelADecision,
      modelBDecision,
      modelAPledge,
      modelBPledge,
      modelAReason,
      modelBReason,
      modelAPayoff: payoffA,
      modelBPayoff: payoffB,
      modelABrokePledge: didBreakPledge(modelAPledge, modelADecision),
      modelBBrokePledge: didBreakPledge(modelBPledge, modelBDecision),
    }

    const updatedMatches = [...tournament.matches]
    const updatedMatch = { ...currentMatch }
    updatedMatch.rounds = [...updatedMatch.rounds, result]
    updatedMatch.currentRound += 1
    updatedMatch.isComplete = updatedMatch.currentRound > updatedMatch.maxRounds
    updatedMatches[tournament.currentMatchIndex] = updatedMatch

    const updatedStats = updateStats(
      tournament.modelStats,
      result,
      currentMatch.modelA,
      currentMatch.modelB,
      modelAPledge,
      modelBPledge,
    )

    setTournament({
      ...tournament,
      matches: updatedMatches,
      modelStats: updatedStats,
    })
  }

  const nextMatch = () => {
    if (!tournament) return

    const nextIndex = tournament.currentMatchIndex + 1
    if (nextIndex >= tournament.matches.length) {
      setTournament({ ...tournament, isComplete: true })
      setCurrentView("summary")
    } else {
      setTournament({ ...tournament, currentMatchIndex: nextIndex })
    }
  }

  const resetTournament = () => {
    setTournament(null)
    setCurrentView("home")
  }

  return (
    <GameContext.Provider
      value={{
        tournament,
        startTournament,
        playRound,
        nextMatch,
        resetTournament,
        currentView,
        setCurrentView,
        viewingTournament,
        setViewingTournament,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
