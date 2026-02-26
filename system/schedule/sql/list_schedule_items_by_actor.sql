-- $1 actor_id, $2 source_id (optional; pass null to list all for actor)
SELECT actor_id, source_id, unit_id, payload,
  next_due_at::text, created_at::text, updated_at::text
FROM schedule_item
WHERE actor_id = $1 AND ($2::text IS NULL OR source_id = $2)
ORDER BY next_due_at
