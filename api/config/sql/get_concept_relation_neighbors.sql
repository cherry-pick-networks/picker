-- $1 array of concept codes. Returns distinct neighbor codes (target where
-- source in $1, source where target in $1). Used for GraphRAG concept expansion.
SELECT DISTINCT code
FROM (
  SELECT target_code AS code
  FROM concept_relation
  WHERE source_code = ANY($1::text[])
  UNION
  SELECT source_code AS code
  FROM concept_relation
  WHERE target_code = ANY($1::text[])
) t
