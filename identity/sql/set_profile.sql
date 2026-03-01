-- $1 id, $2 payload (JSON)
INSERT INTO actor_profile (id, payload, updated_at)
VALUES ($1, $2, now())
ON CONFLICT (id) DO UPDATE SET payload = $2, updated_at = now()
