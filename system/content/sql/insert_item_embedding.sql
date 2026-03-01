-- $1 item_id, $2 embedding (vector string)
INSERT INTO item_embedding (item_id, embedding)
VALUES ($1, $2::vector)
ON CONFLICT (item_id) DO UPDATE SET embedding = $2::vector, updated_at = now()
