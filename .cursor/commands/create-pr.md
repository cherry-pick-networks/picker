# Create PR

Create a draft pull request for the current branch. Reference store.md §7.

- **Before**: Ensure all changes are committed and pushed.
- **Create**: Run `gh pr create --draft`. Use a descriptive title and follow project conventions for
  description, labels, and reviewers.
- **After**: Review with `gh pr view` and `gh pr diff`; mark ready when appropriate. Prefer draft
  PRs for agent-generated changes.
