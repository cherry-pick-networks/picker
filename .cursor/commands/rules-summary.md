# Rules summary

Run `deno task rules:summary -- <task-type>` and show the list of applicable
store.md § for that task type.

- **Task type**: Use whatever the user types after the command (e.g. `feature`,
  `refactor`, `docs`, `commit`, `migration`, `system`, `dependency`, `sql`,
  `directory`, `all`). If nothing is given, use `feature` or infer from context.
- **Output**: List the applicable § briefly; no need to duplicate rule text.
  Reference store.md Rule index (context → sections) and guide.md as needed.
