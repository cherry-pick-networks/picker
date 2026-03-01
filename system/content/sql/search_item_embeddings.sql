-- $1 query_embedding (vector string), $2 limit
SELECT item_id, (embedding <=> $1::vector) AS score
FROM item_embedding
ORDER BY embedding <=> $1::vector
LIMIT $2
