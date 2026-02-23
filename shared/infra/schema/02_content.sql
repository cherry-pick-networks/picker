-- Content domain: items, worksheets, submissions (payload = full document).

CREATE TABLE IF NOT EXISTS content_item (
  item_id TEXT PRIMARY KEY,
  concept_id TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_worksheet (
  worksheet_id TEXT PRIMARY KEY,
  payload JSONB,
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_submission (
  submission_id TEXT PRIMARY KEY,
  payload JSONB,
  updated_at TIMESTAMPTZ
);
