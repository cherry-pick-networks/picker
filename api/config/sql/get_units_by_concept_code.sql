-- $1 scheme_id, $2 code. Returns (source_id, unit_id) pairs for that concept.
SELECT source_id, unit_id
FROM unit_concept
WHERE scheme_id = $1 AND code = $2;
