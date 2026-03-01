-- $1 actor_id, $2 scheme_id, $3 from, $4 to.
-- First recorded_at per code (actual).
SELECT code, min(recorded_at) AS first_at
FROM concept_outcome
WHERE actor_id = $1 AND scheme_id = $2
  AND ($3::timestamptz IS NULL OR recorded_at >= $3)
  AND ($4::timestamptz IS NULL OR recorded_at <= $4)
GROUP BY code
