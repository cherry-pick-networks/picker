-- $1 logical_key, $2 value (JSON)
INSERT INTO kv (logical_key, value) VALUES ($1, $2)
ON CONFLICT (logical_key) DO UPDATE SET value = $2
