-- Allow relation_type 'requires' for concept_relation (Scope 4 LLM ingestion).
-- Run after 05_ontology.sql.

ALTER TABLE concept_relation DROP CONSTRAINT IF EXISTS concept_relation_type_check;
ALTER TABLE concept_relation ADD CONSTRAINT concept_relation_type_check
  CHECK (relation_type IN (
    'broader', 'narrower', 'related', 'exactMatch', 'requires', 'depends-on'
  ));
