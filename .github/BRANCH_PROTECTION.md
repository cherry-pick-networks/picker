# Branch protection (maintainers)

To prevent merging PRs when CI fails (e.g. lint, line-length, or tests), enable
branch protection for the default branch (e.g. `main`).

## Steps

1. **Repo** → **Settings** → **Branches**.
2. Under **Branch protection rules**, click **Add rule** (or edit the rule for
   `main`).
3. **Branch name pattern**: `main` (or your default branch).
4. Enable **Require status checks to pass before merging**.
5. In **Status checks that are required**, search and select **check** (the CI
   job name from [.github/workflows/ci.yml](.github/workflows/ci.yml)). If the list is
   empty, push a commit that runs CI once so the check appears.
6. Save the rule.

After this, PRs cannot be merged until the **check** workflow succeeds. That
ensures lint (including function-length), format, line-length, ts-filename-check,
tests, scope-check, boundary-check, dependency-check, type-check-policy, and
audit all pass before merge.
