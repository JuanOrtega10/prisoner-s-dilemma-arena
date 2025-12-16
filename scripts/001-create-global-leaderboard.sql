-- Create global leaderboard table for storing aggregated model stats across tournaments
CREATE TABLE IF NOT EXISTS global_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id TEXT UNIQUE NOT NULL,
  model_display_name TEXT NOT NULL,
  total_tournaments_played INTEGER DEFAULT 0,
  total_points_sum INTEGER DEFAULT 0,
  total_honesty_sum NUMERIC(10, 2) DEFAULT 0,
  total_cooperation_sum NUMERIC(10, 2) DEFAULT 0,
  average_total_points NUMERIC(10, 2) GENERATED ALWAYS AS (
    CASE WHEN total_tournaments_played > 0 
    THEN total_points_sum::NUMERIC / total_tournaments_played 
    ELSE 0 END
  ) STORED,
  average_honesty_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE WHEN total_tournaments_played > 0 
    THEN total_honesty_sum / total_tournaments_played 
    ELSE 0 END
  ) STORED,
  average_cooperation_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE WHEN total_tournaments_played > 0 
    THEN total_cooperation_sum / total_tournaments_played 
    ELSE 0 END
  ) STORED,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster sorting by average points
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_avg_points ON global_leaderboard(average_total_points DESC);

-- Enable Row Level Security
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON global_leaderboard
  FOR SELECT USING (true);

-- Allow public insert/update for demo purposes
CREATE POLICY "Allow public write access" ON global_leaderboard
  FOR ALL USING (true) WITH CHECK (true);
