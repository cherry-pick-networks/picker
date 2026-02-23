-- Generic key-value (logical key only; value as JSONB).

CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value JSONB
);
