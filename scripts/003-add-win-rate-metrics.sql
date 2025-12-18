-- Migration: Add Win Rate and Points per Match metrics to global_leaderboard
-- This normalizes comparisons between tournaments of different sizes

-- Agregar columnas para tracking de matches
ALTER TABLE global_leaderboard 
ADD COLUMN IF NOT EXISTS total_matches_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_matches_won INTEGER DEFAULT 0;

-- Columna calculada: Win Rate (percentage of matches won)
ALTER TABLE global_leaderboard 
ADD COLUMN IF NOT EXISTS win_rate NUMERIC(5,2) 
GENERATED ALWAYS AS (
  CASE WHEN total_matches_played > 0 
  THEN (total_matches_won::NUMERIC / total_matches_played) * 100 
  ELSE 0 END
) STORED;

-- Columna calculada: Puntos por Match (reuses existing total_points_sum)
ALTER TABLE global_leaderboard 
ADD COLUMN IF NOT EXISTS average_points_per_match NUMERIC(5,2) 
GENERATED ALWAYS AS (
  CASE WHEN total_matches_played > 0 
  THEN total_points_sum::NUMERIC / total_matches_played 
  ELSE 0 END
) STORED;

-- Actualizar indice para ordenar por win_rate en lugar de average_total_points
DROP INDEX IF EXISTS idx_global_leaderboard_avg_points;
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_win_rate ON global_leaderboard(win_rate DESC);


