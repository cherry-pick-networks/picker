-- $1 ids (array), $2 allowed_scheme_ids (array)
SELECT code FROM concept WHERE code = ANY($1) AND scheme_id = ANY($2)
