-- Item embeddings for semantic item search. Run after 05_vector (extension).
-- Optional: items without a row here are excluded from vector search.

CREATE TABLE IF NOT EXISTS item_embedding (
  item_id TEXT PRIMARY KEY,
  embedding vector(1536) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT item_embedding_item_fkey
    FOREIGN KEY (item_id) REFERENCES content_item (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_item_embedding_embedding
  ON item_embedding
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 1);
