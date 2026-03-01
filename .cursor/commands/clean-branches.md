# Clean branches

Leave only **main** locally and sync it with
**origin/main**. All other local branches are deleted.

- **Run**: From repo root, run
  `sh shared/context/scripts/clean-local-branches.sh` (or
  `deno task clean-branches` if the task is defined).
- **Steps**: Checkout main → fetch origin → reset --hard
  origin/main → delete every local branch except main.
- Use after merging PRs when the user wants a clean local
  state (only main, up to date with origin).
