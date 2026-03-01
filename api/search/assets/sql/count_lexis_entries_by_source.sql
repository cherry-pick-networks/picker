-- $1 source_id
SELECT count(*)::int AS total
FROM lexis_entry
WHERE source_id = $1
