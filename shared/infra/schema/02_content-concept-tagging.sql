-- Concept tagging on content (Scope 3). Idempotent; run after 02_content.

ALTER TABLE content_item ADD COLUMN IF NOT EXISTS subject_ids TEXT[] DEFAULT '{}';
ALTER TABLE content_item ADD COLUMN IF NOT EXISTS content_type_id TEXT;
ALTER TABLE content_item ADD COLUMN IF NOT EXISTS cognitive_level_id TEXT;
ALTER TABLE content_item ADD COLUMN IF NOT EXISTS context_ids TEXT[] DEFAULT '{}';

ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS subject_ids TEXT[] DEFAULT '{}';
ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS content_type_id TEXT;
ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS cognitive_level_id TEXT;
ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS context_ids TEXT[] DEFAULT '{}';
