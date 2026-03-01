-- $1 actor_id, $2 from (timestamptz), $3 to (timestamptz)
SELECT actor_id, source_id, unit_id, payload,
  next_due_at::text, created_at::text, updated_at::text
FROM schedule_item
WHERE actor_id = $1
  AND next_due_at >= $2::timestamptz
  AND next_due_at <= $3::timestamptz
ORDER BY next_due_at
