-- Lexis entries per source (e.g. word list book). Run once.

CREATE TABLE IF NOT EXISTS lexis_entry (
  source_id TEXT NOT NULL,
  entry_index INT NOT NULL,
  day_index INT NOT NULL,
  headword TEXT NOT NULL,
  meaning TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lexis_entry_source_fkey
    FOREIGN KEY (source_id) REFERENCES source (source_id) ON DELETE CASCADE,
  PRIMARY KEY (source_id, entry_index),
  CONSTRAINT lexis_entry_day_positive CHECK (day_index >= 1)
);

CREATE INDEX IF NOT EXISTS idx_lexis_entry_source_headword
  ON lexis_entry (source_id, headword);
CREATE INDEX IF NOT EXISTS idx_lexis_entry_source_day
  ON lexis_entry (source_id, day_index);
