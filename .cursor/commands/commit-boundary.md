# Commit boundary

Commit the current changes as one logical unit before starting the next. Reference store.md §A (commit message format), §B (commit and session boundary).

- **Message**: Follow §A: `<type>[(todo)]: <description>`; imperative, lowercase.
- **Procedure**: Run `git status`, `git add`, `git commit` with a message per §A. Do not proceed to the next feature-flag or logical unit without committing the current one. No batch commit at the end.
