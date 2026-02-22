# Branch protection (maintainers)

To prevent merging PRs when CI fails (e.g. lint, line-length, or tests), use
either **branch protection rules** (UI) or **repository rulesets** (API/JSON).

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
ts-filename-check, tests, scope-check, boundary-check, dependency-check,
type-check-policy, and audit all pass before merge.
