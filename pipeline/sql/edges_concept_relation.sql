-- $1 relation_type
SELECT source_scheme_id AS from_scheme, source_code AS from_code,
  target_scheme_id AS to_scheme, target_code AS to_code
FROM concept_relation
WHERE relation_type = $1
