-- $1 actor_id, $2 from, $3 to. Review count from schedule_item (payload).
-- Simplified: count schedule_item rows as engagement proxy.
SELECT count(*)::int AS review_count
FROM schedule_item
WHERE actor_id = $1
  AND ($2::timestamptz IS NULL OR updated_at >= $2)
  AND ($3::timestamptz IS NULL OR updated_at <= $3)
