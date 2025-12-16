"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, ExternalLink, Lightbulb } from "lucide-react"

export function AboutDilemmaModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-1.5" />
          What is the Prisoner's Dilemma?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">What is the Prisoner's Dilemma?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm leading-relaxed">
          {/* Section 1 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">The Core Idea</h3>
            <p className="text-muted-foreground">
              The Prisoner's Dilemma is one of the most famous problems in game theory. It describes a situation where
              two players must choose between cooperation and defection. Even though cooperation would benefit both,
              rational self-interest often pushes players toward defection.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Where It Comes From</h3>
            <p className="text-muted-foreground">
              The dilemma was formalized in the 1950s by mathematicians Merrill Flood and Melvin Dresher while working
              at the RAND Corporation. It became widely known because it captures a deep tension that appears in
              economics, politics, biology, and everyday human behavior.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Why It Became Famous</h3>
            <p className="text-muted-foreground mb-2">The Prisoner's Dilemma is famous because it shows that:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Acting in your own immediate self-interest can lead to worse outcomes for everyone.</li>
              <li>Rational decisions at the individual level do not always produce the best collective result.</li>
              <li>Trust, cooperation, and betrayal can emerge even in very simple systems.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Repeated Games and Strategies</h3>
            <p className="text-muted-foreground mb-2">When the game is played repeatedly, strategies matter:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>
                <strong>Always defect</strong> can win short-term but often destroys cooperation.
              </li>
              <li>
                <strong>Always cooperate</strong> can be exploited.
              </li>
              <li>
                <strong>Conditional strategies</strong> (like cooperating until betrayed, then retaliating) often
                perform well.
              </li>
              <li>
                Famous strategies such as <strong>"Tit for Tat"</strong> showed that cooperation can survive when
                players remember the past.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Why This Game Uses AI Models</h3>
            <p className="text-muted-foreground">
              In this app, AI models play the Prisoner's Dilemma against each other. They make public promises about
              what they intend to do, and then choose what they actually do. By watching this, you can see how different
              models handle trust, temptation, punishment, and long-term strategy.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="font-semibold text-foreground mb-2">Why Promises Matter Here</h3>
            <p className="text-muted-foreground">
              Promises are not binding. They are cheap talk. This makes the game more realistic and interesting: models
              can tell the truth, lie, punish broken promises, or exploit trust — just like humans often do.
            </p>
          </section>

          {/* Callout Box */}
          <section className="mt-6">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Want a deeper intuition?</p>
                  <p className="text-muted-foreground mb-3">
                    This Veritasium video is one of the best science communication explanations of the Prisoner's
                    Dilemma I've seen.
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=mScpHTIi-kM&t=4s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Watch on YouTube
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
