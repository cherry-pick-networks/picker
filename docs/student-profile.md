# Identity: Student–diagnosis FK extension options

Ten ways to extend the design when the student holds the FK (e.g. `student.diagnosis_id` → diagnosis).

---

1. **Single “primary” diagnosis FK**  
   One “current” or “baseline” diagnosis per student via `student.diagnosis_id`; store all other diagnoses in a separate table with `diagnosis.student_id`. (One student = one primary + N diagnosis records.)

2. **Separate diagnosis history table**  
   Put “all diagnoses for this student” in `id_diagnoses` (or a history table) with `student_id` FK; on the student side keep only one FK such as `current_diagnosis_id` for “the diagnosis in use now”.

3. **Diagnosis type column**  
   Add a `kind` on the diagnosis table (e.g. baseline, follow-up, re-assessment); the student FK points only to the “primary” diagnosis; query the rest by `student_id` + `kind`.

4. **Diagnosis version/series**  
   Group a “diagnosis series” (initial + follow-ups) and have the student FK point to the series’ primary (e.g. initial); extend by grouping the rest with a series id.

5. **Reports linked only to diagnosis**  
   Student has only `diagnosis_id`; reports link only via `report.diagnosis_id`. On student delete, leave diagnosis and reports as-is and remove only the student row.

6. **Soft delete + keep “primary” diagnosis**  
   Soft-delete the student (`deleted_at`) and keep the row; leave `student.diagnosis_id` unchanged; filter lists/APIs with `deleted_at IS NULL`. Diagnosis and reports always remain.

7. **Diagnosis as JSON/file reference only**  
   Store only the “primary diagnosis document path” in a non-FK field such as `student.diagnosis_file_path` instead of `student.diagnosis_id`; extend via files without DB FK constraints.

8. **Multiple “primary” FK columns**  
   Add role-based FKs such as `student.baseline_diagnosis_id` and `student.latest_diagnosis_id` to point to “initial” and “most recent” diagnosis at the same time.

9. **Diagnosis–student mapping table**  
   Model student–diagnosis as N:M in a mapping table with a flag like `is_primary` for “the diagnosis the student points to”; extend so the student FK refers to the single “primary” mapping row.

10. **Event sourcing / timeline**  
    Persist diagnoses and reports as “events” and keep one “current snapshot diagnosis id” on the student; extend detailed history in an event store or separate table in time order.

---

Summary: even when the student holds the FK, you can extend by “one primary FK + the rest as history/type/series/mapping table” along these ten directions.
