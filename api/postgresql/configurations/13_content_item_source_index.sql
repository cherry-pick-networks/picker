-- Index for filtering content_item by payload->>'source' (view aggregation).
-- Run after 04_content.sql.

CREATE INDEX IF NOT EXISTS idx_content_item_payload_source
  ON content_item ((payload->>'source'));
