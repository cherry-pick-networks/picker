# Tips-derived usage (Phase 10)

Optional tooling and workflows from shared-document-plan Phase 10. Reference
only; use if the project adopts them.

**Tips already in store.md**: Decompose (Tip 3 → §6), Git/gh/draft
PR/worktree (Tip 4, 16 → §7), New topic → new conversation (Tip 5 → §9), Getting
output out (Tip 6 → §10), Aliases/setup (Tip 7 → §5), Write–test cycle (Tip 9 →
§6), Cmd+A / paste (Tip 10 → §10), Exponential backoff (Tip 17 → §8),
Markdown/Notion (Tip 19, 20 → §10), realpath (Tip 24 → §8), Verify output (Tip
28 → §6), Abstraction level (Tip 32 → §11), TDD (Tip 34 → §6), Plan then
prototype (Tip 39 → §6), Simplify (Tip 40 → §11).

---

## Slash commands (Tip 1)

- When using Claude Code: useful built-ins include `/usage` (rate limits),
  `/mcp` (MCP servers), `/stats` (usage graph), `/clear` (fresh conversation).
  See claude-code-tips for full list.

---

## Status line (Tip 0)

- **Script**: `shared/prompt/scripts/context-bar.sh`
- **Use**: Source in shell or run to print directory, git branch, dirty status.
  Integrate with PS1 or tmux status line if desired.
- **Example**: `source shared/prompt/scripts/context-bar.sh` then use
  `_context_bar` in prompt.

---

## Handoff workflow (Tip 8)

- **When**: Before switching agent or starting a new session on the same
  long-running task.
- **Where**: `shared/prompt/handoff.md` (linked from
  README).
- **Fields**: Goal, progress, what was tried, what failed, next steps. New
  sessions attach only this file.
- **Next steps format**: Bullet list; one item = one logical unit (one commit or
  one scoped task); one sentence per item. If no required follow-up, add at
  least one optional or deferred item. For scope or dependency changes, note
  "Propose scope update first" (or similar). See store.md §9.
- **Optional**: Use `/handoff` (e.g. dx plugin) if available.

---

## Blocked or private sites (Tip 11)

- For URLs that cannot be fetched directly (e.g. Reddit, paywalled): use a
  fallback skill (e.g. reddit-fetch in `~/.claude/skills/` or dx plugin) or
  Gemini CLI. Document the chosen method here or in store.md.

---

## System prompt slim (Tip 15)

- If using a minified CLI or custom system prompt: document the procedure (e.g.
  patch script, `system-prompt/` directory) locally. Do not add to repo without
  scope doc update.

---

## Clone / half-clone (Tip 23)

- For long conversations: use a clone or half-clone script/skill to compact
  context. Optionally suggest `/half-clone` when context exceeds a threshold.
  Reference in tool docs.

---

## Context review (Tip 30)

- When reviewing store.md: use recent conversations to propose new
  lines (repeated instructions → candidates for store.md).
  Optionally use a review skill (e.g. review-claudemd) if available.

---

## Approved commands audit (Tip 33)

- Run **cc-safe** (or equivalent) on a schedule: e.g. `npx cc-safe .` before
  opening a PR or monthly. See store.md §7.

---

## Containers for long-running risky tasks (Tip 21)

- For long-running or risky work (e.g. research,
  `--dangerously-skip-permissions`): prefer running in a container so failures
  are isolated. See store.md §8 for long-running jobs; use a
  container when the task is both long and permission-heavy.

---

## Interactive PR reviews (Tip 26)

- Use `gh pr view` and `gh pr diff` (store.md §7) for step-by-step
  or file-by-file review. Ask the agent to run tests where relevant and to
  summarize findings. Interactive back-and-forth beats one-shot review.

---

## GitHub Actions / DevOps (Tip 29)

- For CI failures: use `gh run view` and logs to find root cause or flakiness
  (store.md §7). If using Claude with dx plugin,
  `/dx:gha <GitHub Actions URL>` can automate investigation and suggest fixes.

---

## Background bash and subagents (Tip 36)

- Long-running commands: run in background (e.g. Ctrl+B in Claude Code) and have
  the agent check later or use exponential backoff (store.md §8).
  When using subagents, run heavy or parallel analysis in background so the main
  session stays responsive.

---

## dx plugin (Tip 44)

- If using Claude with dx: install with `claude plugin install dx@ykdojo` (or
  marketplace). Use for handoff, skills, and other dx-provided commands as
  needed.

---

## Setup script (Tip 45)

- **Script**: `shared/prompt/scripts/setup.sh`
- **Use**: Run once from repo root to make context-bar executable and print
  reminders (cc-safe, handoff path). Add status line to shell profile manually
  if desired.
