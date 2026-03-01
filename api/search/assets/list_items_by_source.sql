-- $1 source_id (payload->>'source'), $2 limit (integer)
SELECT id, payload
FROM content_item
WHERE payload->>'source' = $1
ORDER BY updated_at DESC
LIMIT $2
