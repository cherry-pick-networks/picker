# Api flatten restore

Flatten all files under `api/` to `api/` root, delete existing
directories, run the c2 folder-creation script, then distribute
files back into the right c2 folders and remove empty dirs.

- **Run**: From repo root, run
  `deno task api:flatten-restore`.
- **Steps**: (1) Collect files and build flat-name → dest-path
  mapping (root files → `app/`, `record/` → `config/record/`).
  (2) Copy to temp dir, delete all under `api/`, move flat files
  into `api/`. (3) Run `structure:add-c2-dirs:api`. (4) Move each
  file to its mapped path. (5) Delete empty directories.
- Use when you want to re-run the api c2 layout from a flat
  state (e.g. after manual edits or to re-apply the structure).

**Shared implementation**: Logic is in
`pipeline/config/flattenRestore/` (core + targets). For identity
use `deno task identity:flatten-restore`; see PRIMER.md § Cursor
chat commands (Flatten-restore).
