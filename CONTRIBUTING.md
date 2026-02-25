# Contributing to picker

Thank you for your interest in contributing. This project is maintained by
[cherry-pick](https://cherry-pick.net).

## How to contribute

- **Questions or ideas**: Open a
  [GitHub Discussion](https://github.com/cherry-pick/picker/discussions) (use
  categories such as Q&A or Ideas) or email
  [contact@cherry-pick.net](mailto:contact@cherry-pick.net).
- **Bugs or features**: Open an
  [issue](https://github.com/cherry-pick/picker/issues). For security issues,
  see [SECURITY.md](SECURITY.md).
- **Code**: Open a pull request. Follow the steps below.

Use Discussions for questions and ideas (pick a category such as Q&A or Ideas);
use Issues only for bugs and concrete feature requests.

## Development setup

- **Runtime**: [Deno](https://deno.land/) 2.x.
- **Clone** the repo and from the project root run:
  - `deno task dev` — start dev server (watch)
  - `deno test` — run tests
  - `deno task scope-check` — verify API routes are listed in the scope document
  - `deno task type-check-policy` — verify no type-check bypass (no --no-check,
    @ts-ignore, @ts-expect-error)
  - `deno task line-length-check` — verify line and file length (store.md §P)
- **Pre-commit hook (optional)**: To run lint, format check, and line-length
  check on each commit: `git config core.hooksPath .githooks` and
  `chmod +x .githooks/pre-commit`.
- **Pre-push hook (optional)**: To run `deno task scope-check` automatically
  before every push, install the hook from the repo root:
  `cp shared/prompt/scripts/git-hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push`

## Before submitting a PR

1. **Tests**: `deno test` must pass.
2. **Scope check**: `deno task scope-check` must pass. If you add new API
   routes, modules, or infrastructure, add them to
   [shared/prompt/boundary.md](shared/prompt/boundary.md) first, then implement.
3. **Type-check policy**: `deno task type-check-policy` must pass. Do not
   disable or bypass type checking (no `--no-check`, `@ts-ignore`, or
   `@ts-expect-error`); fix type errors in code or types.
4. **Format and line length (store.md §P)**: `deno fmt --check` and
   `deno task line-length-check` must pass.
5. **Commit messages**: Use the format `<type>[(scope)]: <description>`
   (imperative, lowercase). Types: `feat`, `fix`, `docs`, `chore`, `refactor`,
   `perf`, `test`, `ci`, `build`.
6. **Language**: Code, comments, and docs are in English.

Detailed conventions (directory structure, dependencies, workflow) are in the
shared docs: start from [shared/README.md](shared/README.md) and see
[shared/prompt/store.md](shared/prompt/store.md) for the single source of truth.

## Branching and PR

- **One scope per branch**: Create a branch for a single scope (path prefix such
  as `shared/prompt`, `system/actor`, `.github`, or a single purpose such as
  `format-docs`). Name the branch `<type>/<scope>` (e.g.
  `chore/branch-protection`, `fix/format-docs`).
- **One PR per branch**: Open one pull request per branch. CI must pass before
  merge (see Maintainers below).
- **Scope and boundary**: If you add modules, API routes, or infrastructure,
  update [shared/prompt/boundary.md](shared/prompt/boundary.md) first, then
  implement (store.md §K, §L). When one scope depends on another, merge the
  dependency PR first.

Full rule: store.md §U.

## Maintainers: branch protection

To require CI (lint, line-length, ts-filename-check, tests, etc.) to pass before
merging PRs, see [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).

## Contact

- **General and contribution questions**:
  [contact@cherry-pick.net](mailto:contact@cherry-pick.net)
- **Code of conduct (CoC) concerns**:
  [conduct@cherry-pick.net](mailto:conduct@cherry-pick.net)
- **Security**: [SECURITY.md](SECURITY.md)
