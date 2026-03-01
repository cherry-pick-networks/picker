SELECT level, week_number, slot_index, source_id, unit_id
FROM curriculum_slot
WHERE level = $1
ORDER BY week_number, slot_index;
