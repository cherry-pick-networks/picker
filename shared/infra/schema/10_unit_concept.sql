-- Unit–concept mapping: (source_id, unit_id) ↔ concept (scheme_id, code).
-- Seeded or maintained by import/LLM; read by governance/identity.
-- Run after 06_ontology, 02_source.

CREATE TABLE IF NOT EXISTS unit_concept (
  source_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT NOT NULL,
  CONSTRAINT unit_concept_source_fkey
    FOREIGN KEY (source_id) REFERENCES source (source_id) ON DELETE CASCADE,
  CONSTRAINT unit_concept_concept_fkey
    FOREIGN KEY (scheme_id, code)
    REFERENCES concept (scheme_id, code) ON DELETE CASCADE,
  PRIMARY KEY (source_id, unit_id, scheme_id, code)
);
