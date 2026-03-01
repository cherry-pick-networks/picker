-- $1..$7 actor_id, source_id, unit_id, payload, next_due_at, created_at, updated_at
INSERT INTO schedule_item (
  actor_id, source_id, unit_id, payload,
  next_due_at, created_at, updated_at
)
VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7::timestamptz)
ON CONFLICT (actor_id, source_id, unit_id)
DO UPDATE SET
  payload = $4,
  next_due_at = $5::timestamptz,
  updated_at = $7::timestamptz
