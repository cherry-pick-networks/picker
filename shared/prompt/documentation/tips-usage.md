# Tips-derived usage (Phase 10)

Optional tooling and workflows from implementation-plan Phase 10. Reference only; use if the project adopts them.

---

## Status line (Tip 0)

- **Script**: `shared/prompt/scripts/context-bar.sh`
- **Use**: Source in shell or run to print directory, git branch, dirty status. Integrate with PS1 or tmux status line if desired.
- **Example**: `source shared/prompt/scripts/context-bar.sh` then use `_context_bar` in prompt.

---

## Handoff workflow (Tip 8)

- **When**: Before switching agent or starting a new session on the same long-running task.
- **Where**: `shared/prompt/documentation/handoff.md` (linked from README).
- **Fields**: Goal, progress, what was tried, what failed, next steps. New sessions attach only this file.
- **Optional**: Use `/handoff` (e.g. dx plugin) if available.

---

## Blocked or private sites (Tip 11)

- For URLs that cannot be fetched directly (e.g. Reddit, paywalled): use a fallback skill (e.g. reddit-fetch in `~/.claude/skills/` or dx plugin) or Gemini CLI. Document the chosen method here or in context.md.

---

## System prompt slim (Tip 15)

- If using a minified CLI or custom system prompt: document the procedure (e.g. patch script, `system-prompt/` directory) locally. Do not add to repo without scope doc update.

---

## Clone / half-clone (Tip 23)

- For long conversations: use a clone or half-clone script/skill to compact context. Optionally suggest `/half-clone` when context exceeds a threshold. Reference in tool docs.

---

## Context review (Tip 30)

- When reviewing context.md: use recent conversations to propose new lines (repeated instructions → candidates for context.md). Optionally use a review skill (e.g. review-claudemd) if available.

---

## Approved commands audit (Tip 33)

- Run **cc-safe** (or equivalent) on a schedule: e.g. `npx cc-safe .` before opening a PR or monthly. See context.md §7.

---

## dx plugin (Tip 44)

- If using Claude with dx: install with `claude plugin install dx@ykdojo` (or marketplace). Use for handoff, skills, and other dx-provided commands as needed.

---

## Setup script (Tip 45)

- **Script**: `shared/prompt/scripts/setup.sh`
- **Use**: Run once from repo root to make context-bar executable and print reminders (cc-safe, handoff path). Add status line to shell profile manually if desired.
