-- $1 scheme_id, $2 name
INSERT INTO concept_scheme (scheme_id, name)
VALUES ($1, $2) ON CONFLICT (scheme_id) DO NOTHING
