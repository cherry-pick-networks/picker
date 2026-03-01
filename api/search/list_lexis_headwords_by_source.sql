-- $1 source_id, $2 limit (integer). Returns headwords for preview.
SELECT headword
FROM lexis_entry
WHERE source_id = $1
ORDER BY day_index, entry_index
LIMIT $2
