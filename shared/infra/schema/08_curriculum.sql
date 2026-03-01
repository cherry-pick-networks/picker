-- Curriculum domain: 52-week grid per level (basic | intermediate | advanced).
-- Seeded from shared/infra/seed/curriculum-52weeks.json. Run after 07_schedule.

CREATE TABLE IF NOT EXISTS curriculum_slot (
  level TEXT NOT NULL,
  week_number INT NOT NULL,
  slot_index INT NOT NULL,
  source_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  PRIMARY KEY (level, week_number, slot_index)
);

CREATE INDEX IF NOT EXISTS curriculum_slot_level_week
  ON curriculum_slot (level, week_number);
