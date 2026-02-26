-- $1..$4 actor_id like, actor_id like, source_id like, source_id like
DELETE FROM schedule_item
WHERE actor_id LIKE $1 OR actor_id LIKE $2
  OR source_id LIKE $3 OR source_id LIKE $4
