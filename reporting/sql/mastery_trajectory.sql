-- $1 actor_id, $2 scheme_id, $3 from, $4 to.
-- Daily pass rate (date, pass_count, total).
SELECT date_trunc('day', recorded_at)::date AS day,
  count(*) FILTER (WHERE passed)::int AS pass_count,
  count(*)::int AS total
FROM concept_outcome
WHERE actor_id = $1 AND scheme_id = $2
  AND ($3::timestamptz IS NULL OR recorded_at >= $3)
  AND ($4::timestamptz IS NULL OR recorded_at <= $4)
GROUP BY date_trunc('day', recorded_at)
ORDER BY day
