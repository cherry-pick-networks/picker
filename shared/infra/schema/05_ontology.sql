-- Ontology: SKOS-style concept_scheme, concept (ltree path), concept_relation.
-- Seed: shared/infra/seed/. DAG enforced for relation_type = 'requires' only.

CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE IF NOT EXISTS concept_scheme (
  id TEXT PRIMARY KEY,
  pref_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS concept (
  id TEXT PRIMARY KEY,
  scheme_id TEXT NOT NULL REFERENCES concept_scheme (id) ON DELETE CASCADE,
  pref_label TEXT NOT NULL,
  notation TEXT,
  source TEXT,
  path LTREE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS concept_scheme_id_idx ON concept (scheme_id);
CREATE INDEX IF NOT EXISTS concept_path_idx ON concept USING GIST (path);

CREATE TABLE IF NOT EXISTS concept_relation (
  source_id TEXT NOT NULL REFERENCES concept (id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES concept (id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  PRIMARY KEY (source_id, target_id, relation_type),
  CONSTRAINT concept_relation_type_check CHECK (
    relation_type IN (
      'broader', 'narrower', 'related', 'exactMatch', 'requires', 'depends-on'
    )
  )
);

CREATE INDEX IF NOT EXISTS concept_relation_target_idx
  ON concept_relation (target_id, relation_type);
