-- Content domain: items, worksheets, submissions.

CREATE TABLE IF NOT EXISTS content_item (
  item_id TEXT PRIMARY KEY,
  concept_id TEXT,
  stem TEXT,
  difficulty TEXT,
  created_at TEXT,
  source TEXT,
  options JSONB,
  correct INTEGER,
  parameters JSONB
);

CREATE TABLE IF NOT EXISTS content_worksheet (
  worksheet_id TEXT PRIMARY KEY,
  title TEXT,
  item_ids JSONB DEFAULT '[]',
  generated_at TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS content_submission (
  submission_id TEXT PRIMARY KEY,
  worksheet_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TEXT NOT NULL
);
