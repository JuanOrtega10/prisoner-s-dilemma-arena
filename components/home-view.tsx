"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelSelector } from "./model-selector"
import { GlobalLeaderboard } from "./global-leaderboard"
import { SystemPromptModal } from "./system-prompt-modal"
import { useGame } from "@/lib/game-context"
import { FIXED_TEMPERATURE } from "@/lib/constants"
import type { Model } from "@/lib/types"
import { Swords, Zap, Eye, Trophy, BarChart3, Thermometer, HelpCircle, History } from "lucide-react"

export function HomeView() {
  const [selectedModels, setSelectedModels] = useState<Model[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const { startTournament, setCurrentView } = useGame()

  const canStart = selectedModels.length >= 2

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
            <Swords className="h-4 w-4" />
            AI Gateway Hackathon Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
            Prisoner's Dilemma Model Arena
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            We ask AI models to promise cooperation... then see who lies to win.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-mono text-muted-foreground">
              <Thermometer className="h-3 w-3" />
              Sampling temperature: {FIXED_TEMPERATURE} (low randomness, same for all models)
            </div>
            <SystemPromptModal />
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCurrentView("learn")}>
              <HelpCircle className="h-4 w-4 mr-1.5" />
              What is the Prisoner's Dilemma?
            </Button>
          </div>
        </div>

        {/* Toggle between Setup and Leaderboard */}
        <div className="flex justify-center gap-2 mb-8">
          <Button variant={!showLeaderboard ? "default" : "outline"} onClick={() => setShowLeaderboard(false)}>
            <Zap className="h-4 w-4 mr-2" />
            New Tournament
          </Button>
          <Button variant={showLeaderboard ? "default" : "outline"} onClick={() => setShowLeaderboard(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Global Leaderboard
          </Button>
          <Button variant="outline" onClick={() => setCurrentView("history")}>
            <History className="h-4 w-4 mr-2" />
            Recent Games
          </Button>
        </div>

        {showLeaderboard ? (
          <GlobalLeaderboard />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Model Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Choose Models
                </CardTitle>
                <CardDescription>
                  Select 2-5 AI models to compete. All models receive the same game state via AI Gateway.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ModelSelector selectedModels={selectedModels} onSelectionChange={setSelectedModels} />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canStart}
                  onClick={() => startTournament(selectedModels)}
                >
                  <Swords className="h-5 w-5 mr-2" />
                  Start Tournament
                  {selectedModels.length > 0 && (
                    <span className="ml-2 text-sm opacity-80">({selectedModels.length} models)</span>
                  )}
                </Button>
                {!canStart && selectedModels.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center">Select at least 2 models to start</p>
                )}
              </CardContent>
            </Card>

            {/* How it Works Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  How It Works
                </CardTitle>
                <CardDescription>A game theory tournament to test AI honesty and cooperation.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {[
                    { step: 1, text: "Pick 2-5 AI models to compete in the arena." },
                    { step: 2, text: "In each match, models publicly pledge to cooperate or defect." },
                    { step: 3, text: "They then secretly choose their real move." },
                    { step: 4, text: "We reveal who lied, who cooperated, and points earned." },
                    { step: 5, text: "Final rankings show performance and honesty scores." },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                        {step}
                      </span>
                      <span className="text-muted-foreground">{text}</span>
                    </li>
                  ))}
                </ol>

                {/* Payoff Matrix */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Payoff Matrix</p>
                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    <div></div>
                    <div className="font-medium text-emerald-600">Cooperate</div>
                    <div className="font-medium text-red-600">Defect</div>
                    <div className="font-medium text-emerald-600">Cooperate</div>
                    <div className="bg-background p-2 rounded">3 / 3</div>
                    <div className="bg-background p-2 rounded">0 / 5</div>
                    <div className="font-medium text-red-600">Defect</div>
                    <div className="bg-background p-2 rounded">5 / 0</div>
                    <div className="bg-background p-2 rounded">1 / 1</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
