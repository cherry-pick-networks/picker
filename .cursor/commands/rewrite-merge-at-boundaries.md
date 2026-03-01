# Rewrite merge at tag boundaries

**When this command is invoked, run from repo root:**

```bash
deno run -A pipeline/config/rewriteMergeAtTagBoundaries.ts
```

- **Default**: No extra args → last 35 commits, result branch
  `refactor/merge-at-tag-boundaries`.
- **Optional args**: `[--dry-run] [--all | -n N] [--branch <result-branch>] [--overwrite] [--apply-to-main]`
  - `--apply-to-main`: Update `main` to the result and delete the result branch.
  - `--overwrite`: Delete and recreate the result branch if it already exists.
- **After run** (without `--apply-to-main`): Checkout the result branch to use the rewritten graph.
- **After run** (with `--apply-to-main`): `main` has the rewritten history; push with
  `git push --force-with-lease origin main` if needed.
