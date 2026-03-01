-- Achievement (identity/report): concept pass/fail and item responses.
-- Run after 01_actor, 04_content, 06_ontology.

CREATE TABLE IF NOT EXISTS concept_outcome (
  actor_id TEXT NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT concept_outcome_actor_fkey
    FOREIGN KEY (actor_id) REFERENCES actor_profile (id) ON DELETE CASCADE,
  CONSTRAINT concept_outcome_concept_fkey
    FOREIGN KEY (scheme_id, code)
    REFERENCES concept (scheme_id, code) ON DELETE CASCADE,
  PRIMARY KEY (actor_id, scheme_id, code)
);

CREATE INDEX IF NOT EXISTS concept_outcome_actor_recorded
  ON concept_outcome (actor_id, recorded_at);

CREATE TABLE IF NOT EXISTS item_response (
  id BIGSERIAL PRIMARY KEY,
  actor_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  selected_option_index INT NOT NULL,
  correct BOOLEAN NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT item_response_actor_fkey
    FOREIGN KEY (actor_id) REFERENCES actor_profile (id) ON DELETE CASCADE,
  CONSTRAINT item_response_item_fkey
    FOREIGN KEY (item_id) REFERENCES content_item (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS item_response_actor_recorded
  ON item_response (actor_id, recorded_at);
