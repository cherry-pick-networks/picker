-- $1 actor_id, $2 source_id, $3 unit_id
SELECT actor_id, source_id, unit_id, payload,
  next_due_at::text, created_at::text, updated_at::text
FROM schedule_item
WHERE actor_id = $1 AND source_id = $2 AND unit_id = $3
