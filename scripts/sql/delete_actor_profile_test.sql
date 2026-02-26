-- $1..$3 id ILIKE patterns
DELETE FROM actor_profile WHERE id ILIKE $1 OR id ILIKE $2 OR id ILIKE $3
