-- $1 query_embedding (vector string), $2 limit
SELECT source_id, chunk_index, text, (embedding <=> $1::vector) AS score
FROM source_chunk
ORDER BY embedding <=> $1::vector
LIMIT $2
