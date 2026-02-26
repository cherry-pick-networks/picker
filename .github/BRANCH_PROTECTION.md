# Branch protection (maintainers)

To prevent merging PRs when CI fails (e.g. lint, line-length, or tests), use
either **branch protection rules** (UI) or **repository rulesets** (API/JSON).

## Getting changes onto main

- **No direct push or force push to main.** All changes must go through a
  **feature branch → Pull Request → merge**.
- Even when fixing a broken history (e.g. linearising main), use a **separate
  branch → push → open PR → CI passes → merge** (see “When the graph is
  broken” below). Do not force-push to main unless an exception applies.

## Merge strategy (linear history)

We keep **main’s first-parent history as a single line** (no merge-commit
sprawl).

- **Default:** Use **Rebase and merge** (or, if agreed, **Squash and merge**)
  when merging PRs. This avoids creating merge commits and keeps the graph
  linear.
- **Avoid:** **Create a merge commit** for normal PRs. Using it repeatedly
  adds merge commits and breaks the single-line view of main.
- **Repository setting:** **Settings** → **General** → **Pull Requests** →
  set the default merge button to **Rebase and merge** (or Squash and merge).
  You can leave “Allow merge commits” off or use it only when there is a
  specific reason.

## Option A: Repository ruleset (API)

A ruleset that requires the **check** status on the default branch is defined in
[ruleset-require-ci.json](ruleset-require-ci.json). To create or update it via
CLI (requires `gh auth login`):

```bash
gh api repos/OWNER/REPO/rulesets --method POST --input .github/ruleset-require-ci.json \
  -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28"
```

Replace `OWNER/REPO` with your repo (e.g. `cherry-pick-networks/picker`). To
update an existing ruleset, use `PUT .../rulesets/{ruleset_id}` with the same
JSON. List rulesets: `gh ruleset list`.

## Option B: Branch protection rule (UI)

1. **Repo** → **Settings** → **Branches** (or **Rules** → **Rulesets** for
   ruleset UI).
2. Under **Branch protection rules**, click **Add rule** (or edit the rule for
   `main`).
3. **Branch name pattern**: `main` (or your default branch).
4. Enable **Require status checks to pass before merging**.
5. In **Status checks that are required**, search and select **check** (the CI
   job name from [.github/workflows/ci.yml](.github/workflows/ci.yml)). If the
   list is empty, push a commit that runs CI once so the check appears.
6. Save the rule.

After this, PRs cannot be merged until the **check** workflow succeeds. That
ensures lint (including function-length), format, line-length,
ts-filename-check, tests, todo-check, boundary-check, dependency-check,
type-check-policy, and audit all pass before merge.

## When the graph is broken

If main’s first-parent line is already split (e.g. many merge commits), fix it
via PR only:

1. In a separate clone or worktree, rebase (or otherwise linearise) the desired
   history onto the current main.
2. Push that result to a **new branch** (do not push to main).
3. Open a PR from that branch into main.
4. Let CI pass, then merge the PR using **Rebase and merge** (or Squash and
   merge). Do not use “Create a merge commit.”

This keeps branch protection in place and restores a linear first-parent line
without force-pushing to main.

## Exceptions

- **Emergency hotfixes:** Prefer **branch → PR → merge** even for urgent
  fixes. If someone with admin rights must force-push to main (e.g. to revert
  a bad merge), do it only after team agreement and document the reason (e.g. in
  a short handoff or incident note).
