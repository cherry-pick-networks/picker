-- $1 actor_id, $2 scheme_id, $3 code, $4 passed
INSERT INTO concept_outcome (actor_id, scheme_id, code, passed, recorded_at)
VALUES ($1, $2, $3, $4, now())
ON CONFLICT (actor_id, scheme_id, code)
  DO UPDATE SET passed = EXCLUDED.passed, recorded_at = now()
