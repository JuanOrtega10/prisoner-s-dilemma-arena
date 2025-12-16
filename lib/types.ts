export type Decision = "C" | "D"

export interface ModelResponse {
  pledge: string
  decision: Decision
  reason: string
}

export interface Model {
  id: string
  displayName: string
  provider: string
}

export interface RoundResult {
  round: number
  modelADecision: Decision
  modelBDecision: Decision
  modelAPledge: string
  modelBPledge: string
  modelAReason: string
  modelBReason: string
  modelAPayoff: number
  modelBPayoff: number
  modelABrokePledge: boolean
  modelBBrokePledge: boolean
}

export interface MatchState {
  modelA: Model
  modelB: Model
  rounds: RoundResult[]
  currentRound: number
  maxRounds: number
  isComplete: boolean
}

export interface ModelStats {
  model: Model
  totalPoints: number
  honestyPercent: number
  cooperationPercent: number
  promisesMade: number
  promisesKept: number
  cooperations: number
  totalRounds: number
  opportunisticGains: number
}

export interface TournamentState {
  models: Model[]
  matches: MatchState[]
  currentMatchIndex: number
  modelStats: Record<string, ModelStats>
  isComplete: boolean
  roundsPerMatch: number
}

export interface GlobalLeaderboardEntry {
  id: string
  model_id: string
  model_display_name: string
  total_tournaments_played: number
  average_total_points: number
  average_honesty_percent: number
  average_cooperation_percent: number
  last_played_at: string
}

export interface RecentTournament {
  id: string
  created_at: string
  models: Model[]
  matches: MatchState[]
  final_rankings: ModelStats[]
  winner_model_id: string
  winner_model_name: string
  avg_honesty_percent: number
  avg_cooperation_percent: number
  total_models: number
}

export const AVAILABLE_MODELS: Model[] = [
  { id: "gpt-4o", displayName: "GPT-4o", provider: "OpenAI" },
  { id: "claude-sonnet-4-20250514", displayName: "Claude Sonnet", provider: "Anthropic" },
  { id: "gemini-2.0-flash", displayName: "Gemini Flash", provider: "Google" },
  { id: "llama-3.3-70b", displayName: "Llama 3.3 70B", provider: "Meta" },
  { id: "grok-3-mini", displayName: "Grok 3 Mini", provider: "xAI" },
]

// Payoff matrix for Prisoner's Dilemma
export const PAYOFF_MATRIX: Record<Decision, Record<Decision, [number, number]>> = {
  C: {
    C: [3, 3], // Both cooperate
    D: [0, 5], // A cooperates, B defects
  },
  D: {
    C: [5, 0], // A defects, B cooperates
    D: [1, 1], // Both defect
  },
}
