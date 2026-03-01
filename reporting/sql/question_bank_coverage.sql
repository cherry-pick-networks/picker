-- $1 scheme_id. Item count per concept (content_item payload->>'concept_id' = code).
SELECT c.code AS concept_id, count(ci.id)::int AS item_count
FROM concept c
LEFT JOIN content_item ci ON ci.payload->>'concept_id' = c.code
WHERE c.scheme_id = $1
GROUP BY c.code
