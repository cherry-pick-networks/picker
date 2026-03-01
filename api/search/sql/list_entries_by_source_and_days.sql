-- $1 source_id, $2 day_index[] (integer array)
SELECT source_id, entry_index, day_index, headword, meaning, payload
FROM lexis_entry
WHERE source_id = $1 AND day_index = ANY($2)
ORDER BY day_index, entry_index
