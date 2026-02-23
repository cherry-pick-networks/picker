-- Add payload and updated_at to content tables (idempotent; run after 02_content).

ALTER TABLE content_item ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE content_item ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE content_worksheet ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE content_submission ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE content_submission ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
