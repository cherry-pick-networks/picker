# Rewrite merge at tag boundaries

Run the one-off script that rewrites linear history so merge
commits appear at conventional-commit type boundaries.

- **Run**: From repo root,
  `deno run -A pipeline/config/rewriteMergeAtTagBoundaries.ts`
  `[--dry-run] [--all | -n N] [--branch <result-branch>] [--overwrite] [--apply-to-main]`
- **Default**: Last 35 commits, result branch
  `refactor/merge-at-tag-boundaries`. Use `-n 11` for last 11
  commits, etc.
- **Options**:
  - `--apply-to-main`: After rewriting, update `main` to the result
    (`checkout main` then `reset --hard` to the result tip). Current
    branch becomes `main`.
  - `--overwrite`: Delete and recreate the result branch if it
    already exists (required when re-running).
- **After run** (without `--apply-to-main`): Result is on the new
  branch only; current branch is unchanged. Checkout the result
  branch to use the rewritten graph, or keep working on the current
  branch.
- **After run** (with `--apply-to-main`): `main` points to the
  rewritten history. Push with `git push --force-with-lease origin main`
  if the old history was already pushed.
