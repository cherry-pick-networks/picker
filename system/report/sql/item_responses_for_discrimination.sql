-- $1 scheme_id (unused; filter in app), $2 from, $3 to.
-- Returns item_id, actor_id, correct for discrimination.
SELECT ir.item_id, ir.actor_id, ir.correct
FROM item_response ir
WHERE ($2::timestamptz IS NULL OR ir.recorded_at >= $2)
  AND ($3::timestamptz IS NULL OR ir.recorded_at <= $3)
