-- $1 source_id, $2 entry_index, $3 day_index, $4 headword
INSERT INTO lexis_entry (source_id, entry_index, day_index, headword)
VALUES ($1, $2, $3, $4)
ON CONFLICT (source_id, entry_index) DO UPDATE SET
day_index = $3, headword = $4, updated_at = now()
