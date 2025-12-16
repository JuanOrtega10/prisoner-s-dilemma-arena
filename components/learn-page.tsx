"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGame } from "@/lib/game-context"
import { ArrowLeft, Play, Lightbulb, Users, Brain, History, Target, MessageSquare } from "lucide-react"

export function LearnPage() {
  const { setCurrentView } = useGame()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setCurrentView("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => setCurrentView("home")}>
            <Play className="h-4 w-4 mr-2" />
            Start the Game
          </Button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            What is the Prisoner's Dilemma?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A classic problem in game theory that reveals the tension between individual rationality and collective
            benefit.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: The Core Idea */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">The Core Idea</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Prisoner's Dilemma is one of the most famous problems in game theory. It describes a situation
                    where two players must choose between cooperation and defection. Even though cooperation would
                    benefit both, rational self-interest often pushes players toward defection — creating a paradox
                    where individual rationality leads to collective irrationality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Historical Origin */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Where It Comes From</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The dilemma was formalized in the 1950s by mathematicians Merrill Flood and Melvin Dresher while
                    working at the RAND Corporation during the Cold War. Albert Tucker later gave it its famous
                    "prisoner" framing. It became widely studied because it captures a deep tension that appears in
                    economics, politics, biology, and everyday human behavior.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Why Famous */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Why It Became Famous</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    The Prisoner's Dilemma is famous because it elegantly demonstrates several profound truths:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Acting in your own immediate self-interest can lead to worse outcomes for everyone.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Rational decisions at the individual level do not always produce the best collective result.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Trust, cooperation, and betrayal can emerge even in very simple systems.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Strategies */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Repeated Games and Strategies</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    When the game is played repeatedly, strategies matter. In Robert Axelrod's famous computer
                    tournaments:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        <strong>Always defect</strong> can win short-term but often destroys cooperation and invites
                        retaliation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>
                        <strong>Always cooperate</strong> is kind but can be ruthlessly exploited.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>
                        <strong>Tit for Tat</strong> — cooperate first, then copy the opponent's last move — won
                        Axelrod's tournaments by being "nice, forgiving, and retaliatory."
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: AI Application */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Why This Game Uses AI Models</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    In this app, AI models play the Prisoner's Dilemma against each other. They make public promises
                    about what they intend to do, and then secretly choose what they actually do. By watching this, you
                    can see how different models handle trust, temptation, punishment, and long-term strategy. It's a
                    window into how these models reason about cooperation and competition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Promises */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Why Promises Matter Here</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Promises are not binding. They are "cheap talk" — costless signals that could be lies. This makes
                    the game more realistic and interesting: models can tell the truth, deceive, punish broken promises,
                    or exploit trust — just like humans often do. Watching which models keep their word reveals
                    something about their underlying values and reasoning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Section */}
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Want a Deeper Intuition?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Veritasium video is one of the best science communication explanations of the Prisoner's
                    Dilemma I've seen. It covers the history, the math, and the surprising lessons about cooperation.
                  </p>
                </div>
              </div>

              {/* Responsive YouTube Embed */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/mScpHTIi-kM"
                  title="Veritasium - What Game Theory Reveals About Life, The Universe, and Everything"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center italic">
                "What Game Theory Reveals About Life, The Universe, and Everything" — Veritasium
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10 pb-8">
          <Button variant="outline" size="lg" onClick={() => setCurrentView("home")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button size="lg" onClick={() => setCurrentView("home")}>
            <Play className="h-4 w-4 mr-2" />
            Start the Game
          </Button>
        </div>
      </div>
    </div>
  )
}
