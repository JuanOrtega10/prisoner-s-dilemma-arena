# 🎮 Prisoner's Dilemma Model Arena

An interactive web application where AI models play the classic **Prisoner's Dilemma** against each other. Watch as different language models make public pledges about their intentions, then see who cooperates, who defects, and who breaks their promises.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

## 🎯 What is the Prisoner's Dilemma?

The Prisoner's Dilemma is one of the most famous problems in game theory. It describes a situation where two players must choose between **cooperation** and **defection**. Even though cooperation would benefit both, rational self-interest often pushes players toward defection — creating a paradox where individual rationality leads to collective irrationality.

### Payoff Matrix

| Your Action | Opponent Cooperates | Opponent Defects |
|-------------|---------------------|------------------|
| **Cooperate** | You: 3, They: 3 | You: 0, They: 5 ⭐ |
| **Defect** | You: 5 ⭐, They: 0 | You: 1, They: 1 |

⭐ = Highest single-round payoff (defecting against a cooperator)

### Why Promises Matter

In this app, AI models make **public pledges** before each round. These pledges are "cheap talk" — they cost nothing to make and nothing to break. This makes the game more realistic:

- Models can tell the truth or deceive
- Models can punish broken promises or exploit trust
- Watching which models keep their word reveals something about their underlying values and reasoning

## 📸 Screenshots

### Home - Model Selection
![Home Screen](public/screenshots/screenshot-home.png)

### Live Tournament - Phase Timeline
Watch as models generate pledges and make decisions in real-time with animated loading states.

![Live Generation](public/screenshots/screenshot-live-generation.png)

### Tournament Results
![Tournament Complete](public/screenshots/screenshot-tournament-complete.png)

### Final Rankings
![Final Rankings](public/screenshots/screenshot-final-rankings.png)

### Global Leaderboard
![Global Leaderboard](public/screenshots/screenshot-leaderboard.png)

## 🚀 Features

- **Tournament Mode**: Run automated tournaments between multiple AI models
- **Live Visualization**: Watch pledges and decisions unfold in real-time with animated phases
- **Match History**: Review detailed round-by-round breakdowns with internal reasoning
- **Global Leaderboard**: Track model performance across all tournaments (Supabase)
- **Multiple Models**: GPT-4o, Claude Sonnet, Gemini Flash, and more

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI SDK**: Vercel AI SDK 5.0
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- AI Gateway API key

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/prisoner-s-dilemma-arena.git
cd prisoner-s-dilemma-arena
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Create environment file**

Copy the example below and create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open in browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

Create a `.env.local` file with the following variables:

```env
# ═══════════════════════════════════════════════════════════════
#                     AI GATEWAY API KEY
# ═══════════════════════════════════════════════════════════════
# Required - This single key provides access to all AI models
# (GPT-4o, Claude Sonnet, Gemini Flash, etc.)

AI_GATEWAY_API_KEY=your-ai-gateway-key-here

# ═══════════════════════════════════════════════════════════════
#                     SUPABASE (Optional)
# ═══════════════════════════════════════════════════════════════
# Required only for global leaderboard and recent games persistence

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Setup (Optional)

If you want to persist tournament results and have a global leaderboard:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in `/scripts/` folder in order:
   - `001-create-global-leaderboard.sql`
   - `002-create-recent-tournaments.sql`
   - `003-add-win-rate-metrics.sql`
3. Copy your project URL and anon key to `.env.local`

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-pledge/    # API for generating model pledges
│   │   └── play-round/         # API for generating model decisions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── match-panel.tsx         # Manual match view
│   ├── match-viewer.tsx        # Tournament simulation view
│   ├── round-detail-viewer.tsx # Round details with live phases
│   └── ...
├── lib/
│   ├── constants.ts            # System prompt and settings
│   ├── game-context.tsx        # React context for game state
│   ├── supabase.ts             # Supabase client
│   ├── tournament.ts           # Tournament logic
│   └── types.ts                # TypeScript types
└── scripts/                    # Supabase SQL migrations
```

## 🎮 How It Works

1. **Select Models**: Choose 2 or more AI models to compete
2. **Start Tournament**: Models play round-robin matches (5 rounds each by default)
3. **Watch Live**: See the game unfold in two phases:
   - **Phase 1**: Models generate public pledges (without seeing each other's)
   - **Phase 2**: Models make decisions after seeing opponent's pledge
4. **Review Results**: Analyze internal reasoning, cooperation rates, and pledge-keeping

## 📜 Scripts

```bash
# Development
npm run dev       # Start development server

# Production
npm run build     # Build for production
npm run start     # Start production server

# Linting
npm run lint      # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Add new AI models
- Improve the UI/UX
- Add new game theory variants
- Fix bugs or improve performance

## 📚 Learn More

- [Veritasium: What Game Theory Reveals About Life](https://www.youtube.com/watch?v=mScpHTIi-kM) - Excellent video explanation
- [Stanford Encyclopedia: Prisoner's Dilemma](https://plato.stanford.edu/entries/prisoner-dilemma/)
- [Robert Axelrod's Tournaments](https://en.wikipedia.org/wiki/The_Evolution_of_Cooperation)

## 📄 License

MIT License - feel free to use this project for learning, research, or building your own applications.

---

**Built with ❤️ to explore how AI models handle trust, cooperation, and deception.**
