-- $1 array of concept codes. Returns (code, pref_label).
SELECT code, pref_label FROM concept
WHERE code = ANY($1::text[])
