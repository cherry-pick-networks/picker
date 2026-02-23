-- Source domain: collected sources.

CREATE TABLE IF NOT EXISTS source (
  source_id TEXT PRIMARY KEY,
  url TEXT,
  type TEXT,
  collected_at TEXT,
  metadata JSONB
);
