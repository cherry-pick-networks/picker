-- $1 scheme_id, $2 ids (array)
SELECT code FROM concept WHERE scheme_id = $1 AND code = ANY($2)
