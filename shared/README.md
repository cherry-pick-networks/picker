# shared

Todo for project-wide context, conventions, and tooling.
Start here for documentation and scripts.

## AI and tooling

Project rules and AI usage live in
**`shared/context/RULESET.md`** (single source of truth).
Usage and tips are in
**`shared/context/documentation/PRIMER.md`**. When using
Cursor, see `.cursor/rules`, `.cursor/commands`, and
`.cursor/skills` for how rules and slash commands are
applied.

## Structure

| Path                                             | Purpose                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [context/RULESET.md](context/RULESET.md)         | **Single source of truth** for AI and tooling (rules, conventions, workflow). Attach this file for new sessions.                                                                                                                                                     |
| [context/documentation/](context/documentation/) | MANUAL, FORMAT, POLICY, PRIMER, ACTION (+ openapi.yaml). [PRIMER.md](context/documentation/PRIMER.md) (tips, Copilot API), [POLICY.md](context/documentation/POLICY.md), [MANUAL.md](context/documentation/MANUAL.md), [ACTION.md](context/documentation/ACTION.md). |
| [context/scripts/](context/scripts/)             | Optional tooling (context-bar, setup, todo-check). See [PRIMER.md](context/documentation/PRIMER.md).                                                                                                                                                                 |

## Quick links

- **AI / tooling context**:
  [context/RULESET.md](context/RULESET.md)
- **Project summary & rules**:
  [context/CONTEXT.md](context/CONTEXT.md)
- **Reference & usage** (tips):
  [context/documentation/PRIMER.md](context/documentation/PRIMER.md)
- **Strategy** (migration, rules layout):
  [context/documentation/POLICY.md](context/documentation/POLICY.md)
- **Handoff** (multi-session):
  [context/HANDOFF.md](context/HANDOFF.md)
- **Todo** (modules, API, infra):
  [context/BACKLOG.md](context/BACKLOG.md)
