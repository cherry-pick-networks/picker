# Branch protection (maintainers)

To prevent merging PRs when CI fails (e.g. lint, line-length (100-char), or
tests), use either **branch protection rules** (UI) or **repository rulesets**
(API/JSON).

## Getting changes onto main

- **No direct push or force push to main.** All changes must go through a
  **feature branch → Pull Request → merge**.
- Even when fixing a broken history (e.g. linearising main), use a **separate
  branch → push → open PR → CI passes → merge** (see “When the graph is broken”
  below). Do not force-push to main unless an exception applies.

## Merge strategy (two-parent commits only at merge)

We keep **branch history linear** (one parent per commit) and allow **two
parents only for the commit that merges a branch into the default branch**.

- **On branches:** Keep history linear. Do not merge other branches into the
  feature branch; use rebase to update or tidy the branch. Every commit on the
  branch has exactly one parent.
- **When merging into the default branch:** Use **Create a merge commit**. The
  only commits with two parents are these PR merge commits. Do not use **Rebase
  and merge** or **Squash and merge** for PRs into the default branch.
- **Repository setting:** **Settings** → **General** → **Pull Requests** → set
  the default merge button to **Create a merge commit** and enable **Allow merge
  commits**.

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
ensures lint (including function-length), format, line-length (100-char),
ts-filename-check, tests, todo-check, boundary-check, dependency-check,
type-check-policy, and audit all pass before merge.

## When the graph is broken

If history on main is inconsistent or needs repair, fix it via PR only:

1. In a separate clone or worktree, prepare the desired history (e.g. rebase the
   branch onto current main).
2. Push that result to a **new branch** (do not push to main).
3. Open a PR from that branch into main.
4. Let CI pass, then merge the PR using **Create a merge commit** (same merge
   strategy as above).

This keeps branch protection in place without force-pushing to main.

## Exceptions

- **Emergency hotfixes:** Prefer **branch → PR → merge** even for urgent fixes.
  If someone with admin rights must force-push to main (e.g. to revert a bad
  merge), do it only after team agreement and document the reason (e.g. in a
  short handoff or incident note).
