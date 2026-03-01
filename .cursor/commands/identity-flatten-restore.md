# Identity flatten restore

Flatten all files under `identity/` to `identity/` root, delete
existing directories, then distribute files back into the right
folders and remove empty dirs. No c2 structure script (dirs created
during distribute).

- **Run**: From repo root, run
  `deno task identity:flatten-restore`.
- **Steps**: (1) Collect files and build flat-name → dest-path
  mapping (identity keeps rel path as-is). (2) Copy to temp dir,
  delete all under `identity/`, move flat files into `identity/`.
  (3) Move each file to its mapped path. (4) Delete empty
  directories.
- Use when you want to re-run the identity layout from a flat
  state (e.g. after manual edits or to re-apply the structure).

**Shared implementation**: Logic is in
`pipeline/config/flattenRestore/` (core + targets). For api use
`deno task api:flatten-restore` or `/api-flatten-restore`; see
PRIMER.md § Cursor chat commands (Flatten-restore).
