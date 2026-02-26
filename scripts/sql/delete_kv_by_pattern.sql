-- $1 pattern (e.g. test-%)
DELETE FROM kv WHERE logical_key LIKE $1
