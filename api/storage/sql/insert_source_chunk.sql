-- $1 source_id, $2 chunk_index, $3 text, $4 embedding (vector string)
INSERT INTO source_chunk (source_id, chunk_index, text, embedding)
VALUES ($1, $2, $3, $4::vector)
ON CONFLICT (source_id, chunk_index) DO UPDATE SET text = $3, embedding = $4::vector, updated_at = now()
