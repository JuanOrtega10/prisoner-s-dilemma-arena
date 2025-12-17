"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { TournamentState, Model, RoundResult, RecentTournament } from "./types"
import { initializeTournament, calculatePayoffs, updateStats } from "./tournament"

type ViewType = "home" | "match" | "summary" | "results" | "learn" | "history" | "historyDetail" | "matchReview"

interface GameContextType {
  tournament: TournamentState | null
  startTournament: (models: Model[]) => void
  playRound: (
    modelAPledge: string,
    modelADecision: "C" | "D",
    modelAReason: string,
    modelABrokePledge: boolean,
    modelBPledge: string,
    modelBDecision: "C" | "D",
    modelBReason: string,
    modelBBrokePledge: boolean,
  ) => void
  nextMatch: () => boolean // Returns true if tournament is complete
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
  
  // Track if we need to navigate to summary after tournament completion
  const pendingNavigationRef = useRef<ViewType | null>(null)

  // Handle navigation after state updates
  useEffect(() => {
    if (pendingNavigationRef.current) {
      setCurrentView(pendingNavigationRef.current)
      pendingNavigationRef.current = null
    }
  }, [tournament?.isComplete])

  const startTournament = (models: Model[]) => {
    const newTournament = initializeTournament(models)
    setTournament(newTournament)
    setCurrentView("match")
  }

  const playRound = (
    modelAPledge: string,
    modelADecision: "C" | "D",
    modelAReason: string,
    modelABrokePledge: boolean,
    modelBPledge: string,
    modelBDecision: "C" | "D",
    modelBReason: string,
    modelBBrokePledge: boolean,
  ) => {
    setTournament((prev) => {
      if (!prev) return null

      const currentMatch = prev.matches[prev.currentMatchIndex]
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
        modelABrokePledge,
        modelBBrokePledge,
      }

      const updatedMatches = [...prev.matches]
      const updatedMatch = { ...currentMatch }
      updatedMatch.rounds = [...updatedMatch.rounds, result]
      updatedMatch.currentRound += 1
      updatedMatch.isComplete = updatedMatch.currentRound > updatedMatch.maxRounds
      updatedMatches[prev.currentMatchIndex] = updatedMatch

      const updatedStats = updateStats(
        prev.modelStats,
        result,
        currentMatch.modelA,
        currentMatch.modelB,
        modelAPledge,
        modelBPledge,
      )

      return {
        ...prev,
        matches: updatedMatches,
        modelStats: updatedStats,
      }
    })
  }

  const nextMatch = (): boolean => {
    let isComplete = false
    
    setTournament((prev) => {
      if (!prev) return null

      const nextIndex = prev.currentMatchIndex + 1
      if (nextIndex >= prev.matches.length) {
        isComplete = true
        pendingNavigationRef.current = "summary"
        return { ...prev, isComplete: true }
      }
      return { ...prev, currentMatchIndex: nextIndex }
    })
    
    return isComplete
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
