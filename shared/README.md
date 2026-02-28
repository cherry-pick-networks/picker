# shared

Todo for project-wide context, conventions, and tooling. Start here for prompts,
documentation, and scripts.

## AI and tooling

Project rules and AI usage live in **`shared/prompt/store.md`** (single source
of truth). Usage and tips are in **`shared/prompt/documentation/guide.md`**.
When using Cursor, see `.cursor/rules`, `.cursor/commands`, and `.cursor/skills`
for how rules and slash commands are applied.

## Structure

| Path                                           | Purpose                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [prompt/store.md](prompt/store.md)             | **Single source of truth** for AI and tooling (rules, conventions, workflow). Attach this file for new sessions.               |
| [prompt/documentation/](prompt/documentation/) | Human-readable docs: [guide.md](prompt/documentation/guide.md) (tips, usage), [strategy.md](prompt/documentation/strategy.md). |
| [prompt/scripts/](prompt/scripts/)             | Optional tooling (context-bar, setup, todo-check). See [guide.md](prompt/documentation/guide.md).                              |

## Quick links

- **AI / tooling context**: [prompt/store.md](prompt/store.md)
- **Project summary & rules**: [prompt/overview.md](prompt/overview.md)
- **Reference & usage** (tips):
  [prompt/documentation/guide.md](prompt/documentation/guide.md)
- **Strategy** (migration, rules layout):
  [prompt/documentation/strategy.md](prompt/documentation/strategy.md)
- **Handoff** (multi-session): [prompt/handoff.md](prompt/handoff.md)
- **Todo** (modules, API, infra): [prompt/to-do.md](prompt/to-do.md)
