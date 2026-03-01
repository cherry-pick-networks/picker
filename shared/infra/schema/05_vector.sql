-- Vector extension and source chunk embeddings. Run once.
-- Requires pgvector installed (e.g. CREATE EXTENSION vector).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS source_chunk (
  source_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_id, chunk_index),
  CONSTRAINT source_chunk_source_fkey
    FOREIGN KEY (source_id) REFERENCES source (source_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_source_chunk_embedding
  ON source_chunk
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 1);
