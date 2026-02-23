-- Actor domain: profile and progress.

CREATE TABLE IF NOT EXISTS actor_profile (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  grade TEXT,
  preferences JSONB,
  goals JSONB
);

CREATE TABLE IF NOT EXISTS actor_progress (
  id TEXT PRIMARY KEY,
  updated_at TEXT NOT NULL,
  state TEXT,
  current_step TEXT
);
