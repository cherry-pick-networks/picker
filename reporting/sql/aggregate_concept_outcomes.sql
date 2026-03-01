-- $1 actor_ids (text[]), $2 scheme_id, $3 from (timestamptz), $4 to (timestamptz).
-- Returns scheme_id, code, passed, count.
SELECT scheme_id, code, passed, count(*)::int AS cnt
FROM concept_outcome
WHERE actor_id = ANY($1::text[])
  AND scheme_id = $2
  AND ($3::timestamptz IS NULL OR recorded_at >= $3)
  AND ($4::timestamptz IS NULL OR recorded_at <= $4)
GROUP BY scheme_id, code, passed
