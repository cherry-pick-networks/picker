-- $1 actor_id, $2 from (timestamptz nullable), $3 to (timestamptz nullable)
SELECT id, actor_id, item_id, selected_option_index, correct, recorded_at
FROM item_response
WHERE actor_id = $1
  AND ($2::timestamptz IS NULL OR recorded_at >= $2)
  AND ($3::timestamptz IS NULL OR recorded_at <= $3)
ORDER BY recorded_at DESC
