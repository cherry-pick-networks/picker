-- $1 scheme_id, $2 code, $3 pref_label, $4 path (ltree)
INSERT INTO concept (scheme_id, code, pref_label, path)
VALUES ($1, $2, $3, $4::ltree) ON CONFLICT (scheme_id, code) DO NOTHING
