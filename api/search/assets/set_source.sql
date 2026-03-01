-- $1 source_id, $2 payload (JSON)
INSERT INTO source (source_id, payload, updated_at)
VALUES ($1, $2, now())
ON CONFLICT (source_id) DO UPDATE SET payload = $2, updated_at = now()
