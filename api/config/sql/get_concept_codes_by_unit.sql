-- $1 source_id, $2 unit_id. Returns concept codes (concept_id) for that unit.
SELECT code
FROM unit_concept
WHERE source_id = $1 AND unit_id = $2;
