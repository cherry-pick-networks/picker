-- Schedule domain: FSRS state per (actor, source, unit). Run once.

CREATE TABLE IF NOT EXISTS schedule_item (
  actor_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  next_due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_id, source_id, unit_id)
);

CREATE INDEX IF NOT EXISTS schedule_item_actor_next_due
  ON schedule_item (actor_id, next_due_at);
