-- $1, $2 source_id LIKE patterns
DELETE FROM source WHERE source_id LIKE $1 OR source_id LIKE $2
