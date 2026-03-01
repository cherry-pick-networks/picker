-- $1 array of concept codes. Returns distinct successor codes (source of
-- relation where target in $1) for relation_type = 'requires' only.
SELECT DISTINCT source_code AS code
FROM concept_relation
WHERE relation_type = 'requires'
  AND target_code = ANY($1::text[]);
