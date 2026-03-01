-- $1 prefix (e.g. "foo%")
SELECT logical_key FROM kv WHERE logical_key LIKE $1
ORDER BY logical_key
