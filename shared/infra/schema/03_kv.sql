-- Generic key-value (system/kv API backend). Run once.

CREATE TABLE IF NOT EXISTS kv (
  logical_key TEXT PRIMARY KEY,
  value JSONB
);
