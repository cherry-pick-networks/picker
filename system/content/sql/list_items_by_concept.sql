-- $1 concept_id
SELECT payload FROM content_item WHERE payload->>'concept_id' = $1
