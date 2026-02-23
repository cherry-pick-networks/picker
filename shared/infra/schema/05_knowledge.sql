-- Knowledge graph: nodes and edges for English teaching materials.
-- Single DB; domain store in system/content (knowledge.store.ts).

CREATE TABLE IF NOT EXISTS knowledge_node (
  id TEXT PRIMARY KEY,
  type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS knowledge_edge (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ,
  PRIMARY KEY (from_id, to_id, type)
);
