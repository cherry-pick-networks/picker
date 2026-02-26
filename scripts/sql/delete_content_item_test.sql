-- $1, $2 id ILIKE patterns
DELETE FROM content_item WHERE id ILIKE $1 OR id ILIKE $2
