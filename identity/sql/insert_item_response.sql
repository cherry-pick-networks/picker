-- $1 actor_id, $2 item_id, $3 selected_option_index, $4 correct
INSERT INTO item_response (actor_id, item_id, selected_option_index, correct)
VALUES ($1, $2, $3, $4)
RETURNING id, actor_id, item_id, selected_option_index, correct, recorded_at
