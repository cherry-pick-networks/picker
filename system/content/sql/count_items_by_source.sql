-- $1 source_id (payload->>'source')
SELECT count(*)::int AS total
FROM content_item
WHERE payload->>'source' = $1
