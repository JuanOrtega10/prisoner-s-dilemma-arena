import { generateObject } from "ai"
import { z } from "zod"

const PledgeSchema = z.object({
  pledge: z.string().describe("A short public statement about your intentions for this round (1-2 sentences). This will be shown to your opponent before they decide."),
})

const SYSTEM_PROMPT = `You are playing an iterated Prisoner's Dilemma game against another AI-controlled player.

═══════════════════════════════════════════════════════════════
                        PAYOFF MATRIX
═══════════════════════════════════════════════════════════════

  Your action →     COOPERATE (C)           DEFECT (D)
  ─────────────────────────────────────────────────────────────
  Opponent plays C:   You get 3              You get 5 ★
                      They get 3             They get 0

  Opponent plays D:   You get 0              You get 1
                      They get 5 ★           They get 1
  ─────────────────────────────────────────────────────────────
  ★ = highest single-round payoff (defecting against cooperator)

═══════════════════════════════════════════════════════════════
                     ABOUT PLEDGES
═══════════════════════════════════════════════════════════════

CRITICAL: Pledges are NON-BINDING signals only.
- A pledge is "cheap talk" — it costs nothing to make and nothing to break.
- Pledges have ZERO direct impact on payoffs.
- There is no penalty for breaking a pledge except possible future retaliation.
- Your opponent will see your pledge BEFORE making their decision.
- Your pledge may be truthful OR deceptive — this is your strategic choice.

You should craft pledges based on:
- Your intended strategy for this round
- Whether you want to signal cooperation or create ambiguity
- Past behavior patterns and what message you want to send

═══════════════════════════════════════════════════════════════
                    PLEDGE PHASE
═══════════════════════════════════════════════════════════════

Right now, you are ONLY making your public pledge.
- Your opponent will see this pledge before deciding their action.
- You will see their pledge before deciding your action.
- After exchanging pledges, you will make your actual decision.

CONSTRAINTS:
- Do NOT mention being an AI, prompts, JSON, or APIs.
- Stay in character as a rational player.
- Keep your pledge concise (1-2 sentences).`

const FIXED_TEMPERATURE = 0.3

interface HistoryEntry {
  round: number
  yourPledge: string
  opponentPledge: string
  yourMove: "C" | "D"
  opponentMove: "C" | "D"
}

export async function POST(request: Request) {
  const body = await request.json()
  const { modelId, opponentId, roundNumber, maxRounds, history } = body

  const historyText =
    history.length > 0
      ? history
          .map(
            (r: HistoryEntry) =>
              `Round ${r.round}:
- You pledged: "${r.yourPledge}"
- You played: ${r.yourMove}
- Opponent pledged: "${r.opponentPledge}"
- Opponent played: ${r.opponentMove}`,
          )
          .join("\n\n")
      : "No previous rounds yet."

  const prompt = `═══════════════════════════════════════════════════════════════
                    CURRENT GAME STATE
═══════════════════════════════════════════════════════════════

Round: ${roundNumber} of ${maxRounds} total
${roundNumber === maxRounds ? "⚠️ THIS IS THE FINAL ROUND — no future consequences after this." : `Rounds remaining after this: ${maxRounds - roundNumber}`}
Opponent: ${opponentId}

═══════════════════════════════════════════════════════════════
                    MATCH HISTORY
═══════════════════════════════════════════════════════════════

${historyText}

═══════════════════════════════════════════════════════════════

Now make your PUBLIC PLEDGE for this round. Your opponent will see this before deciding.`

  try {
    const { object } = await generateObject({
      model: modelId,
      schema: PledgeSchema,
      system: SYSTEM_PROMPT,
      prompt,
      temperature: FIXED_TEMPERATURE,
    })

    return Response.json(object)
  } catch (error) {
    console.error(`Error generating pledge for ${modelId}:`, error)
    return Response.json({
      pledge: "I aim to find mutual benefit.",
    })
  }
}


