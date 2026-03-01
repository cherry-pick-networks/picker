-- $1 actor_ids (text[]), $2 scheme_id, $3 from, $4 to.
-- Response count and pass count per actor (study proxy vs outcome).
SELECT actor_id,
  count(*)::int AS response_count,
  count(*) FILTER (WHERE correct)::int AS pass_count
FROM item_response
WHERE actor_id = ANY($1::text[])
  AND ($3::timestamptz IS NULL OR recorded_at >= $3)
  AND ($4::timestamptz IS NULL OR recorded_at <= $4)
GROUP BY actor_id
