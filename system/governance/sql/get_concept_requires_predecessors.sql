-- $1 array of concept codes. Returns distinct predecessor codes (target of
-- relation where source in $1) for relation_type = 'requires' only.
SELECT DISTINCT target_code AS code
FROM concept_relation
WHERE relation_type = 'requires'
  AND source_code = ANY($1::text[]);
