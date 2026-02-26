-- $1..$3 id ILIKE patterns
DELETE FROM actor_progress WHERE id ILIKE $1 OR id ILIKE $2 OR id ILIKE $3
