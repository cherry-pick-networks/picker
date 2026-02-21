# Contributing to picker

Thank you for your interest in contributing. This project is maintained by [cherry-pick](https://cherry-pick.net).

## How to contribute

- **Questions or ideas**: Open a [GitHub Discussion](https://github.com/cherry-pick/picker/discussions) or email [contact@cherry-pick.net](mailto:contact@cherry-pick.net).
- **Bugs or features**: Open an [issue](https://github.com/cherry-pick/picker/issues). For security issues, see [SECURITY.md](SECURITY.md).
- **Code**: Open a pull request. Follow the steps below.

## Development setup

- **Runtime**: [Deno](https://deno.land/) 2.x.
- **Clone** the repo and from the project root run:
  - `deno task dev` — start dev server (watch)
  - `deno test` — run tests
  - `deno task scope-check` — verify API routes are listed in the scope document

## Before submitting a PR

1. **Tests**: `deno test` must pass.
2. **Scope check**: `deno task scope-check` must pass. If you add new API routes, modules, or infrastructure, add them to [shared/prompt/documentation/scope.md](shared/prompt/documentation/scope.md) first, then implement.
3. **Commit messages**: Use the format `<type>[(scope)]: <description>` (imperative, lowercase). Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`.
4. **Language**: Code, comments, and docs are in English.

Detailed conventions (directory structure, dependencies, workflow) are in the shared docs: start from [shared/README.md](shared/README.md) and see [shared/prompt/store/context.md](shared/prompt/store/context.md) for the single source of truth.

## Contact

- **General and contribution questions**: [contact@cherry-pick.net](mailto:contact@cherry-pick.net)
- **Code of conduct (CoC) concerns**: [conduct@cherry-pick.net](mailto:conduct@cherry-pick.net)
- **Security**: [SECURITY.md](SECURITY.md)
