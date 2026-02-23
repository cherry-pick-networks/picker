-- Source domain: collected sources (payload = full document).

CREATE TABLE IF NOT EXISTS source (
  source_id TEXT PRIMARY KEY,
  payload JSONB,
  updated_at TIMESTAMPTZ
);
