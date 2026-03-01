# Rewrite merge at tag boundaries

Run the one-off script that rewrites linear history so merge
commits appear at conventional-commit type boundaries. Result
is written to a **new branch** only; current branch is left
unchanged.

- **Run**: From repo root,
  `deno run -A sharepoint/context/scripts/rewriteMergeAtTagBoundaries.ts`
  `[--dry-run] [--all | -n N] [--branch <result-branch>]`
- **Default**: Last 35 commits, result branch
  `refactor/merge-at-tag-boundaries`. Use `-n 11` for last 11
  commits, etc.
- **After run**: Checkout the result branch to use the rewritten
  graph, or leave it and keep working on the current branch.
