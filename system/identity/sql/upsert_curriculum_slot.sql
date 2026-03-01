-- $1 level, $2 week_number, $3 slot_index, $4 source_id, $5 unit_id
INSERT INTO curriculum_slot (level, week_number, slot_index, source_id, unit_id)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (level, week_number, slot_index)
DO UPDATE SET source_id = EXCLUDED.source_id, unit_id = EXCLUDED.unit_id
