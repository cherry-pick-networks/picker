-- $1 actor_ids (text[]), $2 scheme_id, $3 from, $4 to.
-- Returns actor_id, code, pass_count, total.
SELECT actor_id, code,
  count(*) FILTER (WHERE passed)::int AS pass_count,
  count(*)::int AS total
FROM concept_outcome
WHERE actor_id = ANY($1::text[])
  AND scheme_id = $2
  AND ($3::timestamptz IS NULL OR recorded_at >= $3)
  AND ($4::timestamptz IS NULL OR recorded_at <= $4)
GROUP BY actor_id, code
