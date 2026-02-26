-- Ontology: concept schemes and concepts. Run once.

CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE IF NOT EXISTS concept_scheme (
  scheme_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS concept (
  scheme_id TEXT NOT NULL,
  code TEXT NOT NULL,
  pref_label TEXT NOT NULL,
  path ltree,
  CONSTRAINT concept_scheme_fkey
    FOREIGN KEY (scheme_id) REFERENCES concept_scheme (scheme_id) ON DELETE CASCADE,
  PRIMARY KEY (scheme_id, code)
);

CREATE TABLE IF NOT EXISTS concept_relation (
  source_scheme_id TEXT NOT NULL,
  source_code TEXT NOT NULL,
  target_scheme_id TEXT NOT NULL,
  target_code TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  CONSTRAINT concept_relation_source_fkey
    FOREIGN KEY (source_scheme_id, source_code)
    REFERENCES concept (scheme_id, code) ON DELETE CASCADE,
  CONSTRAINT concept_relation_target_fkey
    FOREIGN KEY (target_scheme_id, target_code)
    REFERENCES concept (scheme_id, code) ON DELETE CASCADE,
  PRIMARY KEY (
    source_scheme_id,
    source_code,
    target_scheme_id,
    target_code,
    relation_type
  )
);
