-- $1 scheme_id, $2 from, $3 to. Outcome count per code.
SELECT code, count(*)::int AS outcome_count
FROM concept_outcome
WHERE scheme_id = $1
  AND ($2::timestamptz IS NULL OR recorded_at >= $2)
  AND ($3::timestamptz IS NULL OR recorded_at <= $3)
GROUP BY code
