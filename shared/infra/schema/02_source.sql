-- Source domain. Run once (e.g. migration or app bootstrap).

CREATE TABLE IF NOT EXISTS source (
  source_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
