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
  - `deno task test` — run tests (uses same DB env as dev; requires
    [pass](https://www.passwordstore.org/) and `picker/postgres` entry)
  - `deno task db:schema`, `deno task seed:ontology`,
    `deno task ontology-acyclic-check` — DB tasks (same env as dev)
  - `deno task pre-push` — same checks as CI (includes test; requires same DB
    env)
  - `deno task todo-check` — verify API routes are listed in the todo document
  - `deno task type-check-policy` — verify no type-check bypass (no --no-check,
    @ts-ignore, @ts-expect-error)
  - `deno task line-length-check` — verify line and file length (store.md §P)
- **Pre-commit hook (optional)**: To run lint, format check, and line-length
  check on each commit: `git config core.hooksPath .githooks` and
  `chmod +x .githooks/pre-commit`.
- **Pre-push hook (optional)**: To run `deno task todo-check` automatically
  before every push, install the hook from the repo root:
  `cp shared/prompt/scripts/git-hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push`

## Before submitting a PR

1. **Tests**: `deno test` must pass.
2. **Todo check**: `deno task todo-check` must pass. If you add new API routes,
   modules, or infrastructure, add them to
   [shared/prompt/to-do.md](shared/prompt/to-do.md) first, then implement.
3. **Type-check policy**: `deno task type-check-policy` must pass. Do not
   disable or bypass type checking (no `--no-check`, `@ts-ignore`, or
   `@ts-expect-error`); fix type errors in code or types.
4. **Format and line length (store.md §P)**: Run `deno fmt` after editing code,
   then ensure `deno task format-check` passes. For line-length failures on long
   imports or strings, see the line-break patterns in store.md §P.
5. **Commit messages**: Use the format `<type>[(todo)]: <description>`
   (imperative, lowercase). Types: `feat`, `fix`, `docs`, `chore`, `refactor`,
   `perf`, `test`, `ci`, `build`.
6. **Language**: Code, comments, and docs are in English.

Detailed conventions (directory structure, dependencies, workflow) are in the
shared docs: start from [shared/README.md](shared/README.md) and see
[shared/prompt/store.md](shared/prompt/store.md) for the single source of truth.

## Maintainers: branch protection

To require CI (lint, line-length, ts-filename-check, tests, etc.) to pass before
merging PRs, see [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).

## Contact

- **General and contribution questions**:
  [contact@cherry-pick.net](mailto:contact@cherry-pick.net)
- **Code of conduct (CoC) concerns**:
  [conduct@cherry-pick.net](mailto:conduct@cherry-pick.net)
- **Security**: [SECURITY.md](SECURITY.md)
