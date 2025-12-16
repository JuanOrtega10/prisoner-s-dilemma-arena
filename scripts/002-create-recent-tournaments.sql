-- Create the recent_tournaments table to store full tournament history
CREATE TABLE IF NOT EXISTS recent_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  models JSONB NOT NULL,
  matches JSONB NOT NULL,
  final_rankings JSONB NOT NULL,
  winner_model_id TEXT NOT NULL,
  winner_model_name TEXT NOT NULL,
  avg_honesty_percent NUMERIC NOT NULL,
  avg_cooperation_percent NUMERIC NOT NULL,
  total_models INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE recent_tournaments ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON recent_tournaments
  FOR SELECT USING (true);

-- Allow public write access  
CREATE POLICY "Allow public write access" ON recent_tournaments
  FOR ALL USING (true);

-- Create an index on created_at for efficient sorting
CREATE INDEX idx_recent_tournaments_created_at ON recent_tournaments(created_at DESC);
