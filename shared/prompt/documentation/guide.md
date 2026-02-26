---
title: guide
description: Tips and usage; reference only.
---

# Tips and usage (reference only)

Optional tooling and workflows. Reference only; use if the project adopts them.\
Nothing here is a rule or checklist; compliance is not checked.

**Tips already in store.md**: Decompose (Tip 3 → §6), Git/gh/draft PR/worktree
(Tip 4, 16 → §7), New topic → new conversation (Tip 5 → §9), Getting output out
(Tip 6 → §10), Aliases/setup (Tip 7 → §5), Write–test cycle (Tip 9 → §6), Cmd+A
/ paste (Tip 10 → §10), Exponential backoff (Tip 17 → §8), Markdown/Notion (Tip
19, 20 → §10), realpath (Tip 24 → §8), Verify output (Tip 28 → §6), Abstraction
level (Tip 32 → §11), TDD (Tip 34 → §6), Plan then prototype (Tip 39 → §6),
Simplify (Tip 40 → §11).

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
- **Where**: `shared/prompt/handoff.md` (linked from README).
- **Fields**: Goal, progress, what was tried, what failed, next steps. New
  sessions attach only this file. When handoff is the main context, the agent
  outputs work plan → execution steps → recommended direction for the first Next
  steps item, then proceeds (see handoff.md "Session start (for AI)").
- **Next steps format**: Bullet list; one item = one logical unit (one commit or
  one todo task); one sentence per item. If no required follow-up, add at least
  one optional or deferred item. For todo or dependency changes, note "Propose
  todo update first" (or similar). See store.md §9.
- **Optional**: Use `/handoff` (e.g. dx plugin) if available.

---

## §P compliance (AI workflow and plan)

**Goal**: Reduce CI failures from the function-length lint (§P: 2–4 statements
per block body) by steering AI toward a design-first workflow and small-function
patterns. See store.md §P and shared/prompt/documentation/reference.md (§P
pattern guide).

**Three-step workflow for AI** (store.md §P): (1) Design — list function
signatures and roles only; (2) Implement — one function at a time, with a
comment stating statement count per body; (3) Self-review — find and fix any 5+
statement or non-exempt single-statement body.

**Patterns**: Prefer functional style (filter/map/reduce, pipeline) and
delegation; use the complex-statement exemption (single try/catch, switch, or
block-bodied if) where it fits. Reserve `// function-length-ignore-file` for
CI/utility scripts; document the reason at the top of the file.

**Checklist** (when implementing this plan): AI behaviour guidelines in Cursor
rules; §P pattern guide in reference.md; file-level ignore policy in store.md
§P; optional refactor or ignore-for-script for specific scripts (e.g.
check-sql-filename).

---

## Phase-gated feature (store.md §Q)

When implementing a **new feature** (not refactor/docs/urgent fix), use the
four-phase cycle: requirement summary → interface design → implementation →
test/commit. Between phase 1 and 2, and between 2 and 3, the agent stops and
asks for your approval; do not proceed until you reply (e.g. "Approve", "OK",
"Proceed to next phase"). **Phase flags** (strategy.md): Start your prompt with
`[Phase 1]`, `[Phase 2]`, or `[Phase 3]` so the agent knows which step to run.
Example: "[Phase 1] Add validation for POST /content/worksheets. Entry:
system/routes/content.ts."

---

## rules:summary — applicable rules by task

- **Command**: `deno task rules:summary -- <task-type>` (run from repo root).
- **Purpose**: Print the list of store.md § that apply to the given task type,
  plus a one-line title per section. Use when you need to know which rules to
  follow for the current context.
- **Task types**: `feature` | `refactor` | `docs` | `commit` | `migration` |
  `system` | `dependency` | `sql` | `directory` | `all`.
- **Optional flags**: `--code`, `--docs`, `--system` to add those contexts'
  sections to the output.
- **Output**: Line "Applicable sections: §X, §Y, …" then each § with its title from
  store.md Part B. Full rule text stays in `shared/prompt/store.md`; Rule index
  is in store.md "Rule index (context → sections)".

---

## Subagents for rules

When to use subagents (e.g. mcp_task with explore or generalPurpose): the main
agent gets the applicable § list via `deno task rules:summary -- <task-type>` or
the matching skill; delegate **heavy verification** to a subagent when needed.

**Scenario 1 — Rule compliance check**: "Does this change satisfy §P and §N?"
→ Have the subagent check the diff or path against store.md §P, §N (function
body 2–4 statements, line length 80, no type-check bypass). Return a short list
of violations or OK.

**Scenario 2 — Applicable § list**: For the current path or task type, which §
apply? Prefer `rules:summary`; if the case is complex, the subagent can explore
store.md and the Rule index.

**Principle**: Main agent secures "which § to apply" via rules:summary or
skills; only delegate verification or deep exploration to subagents.

**Verification task example** (for pre-push or "check this patch"): Give the
subagent a task description like: "Given store.md §P and §N, check that the
changes in <path> satisfy function body 2–4 statements, line length 80, and no
type-check bypass. Return a short list of violations or OK."

---

## Session start (first message)

- **When**: Starting a new agent or chat session in Cursor (store.md §9).
- **Goal**: First message: one short sentence stating the session goal (store.md
  §9 allows Korean for Cursor chat titles).
- **Format**: One sentence; under 15 words or ~40 characters; state one task or
  one question. Add context in a second message if needed.
- **Templates**:
  - Task: `[todo/target] + [what to do]` — e.g.
    `Add routes missing from todo.md to todo-check`
  - Analysis: `[symptom/error] + find cause` — e.g.
    `Find why type-check-policy fails`
  - Refactor: `[target] + [direction]` — e.g.
    `Split content service functions over 80 lines`
- **Procedure**: Open new chat → state goal in one sentence → send; optionally
  rename the tab later in chat history if the auto-title is not ideal. If the
  task involves code changes, the agent should create a branch from the default
  branch first (or confirm the current branch is not the default), then proceed.
- **Snippet**: Use the `agent-start` snippet
  (`.vscode/cursor-session.code-snippets`) to paste the template and fill in the
  bracketed part.

---

## Blocked or private sites (Tip 11)

- For URLs that cannot be fetched directly (e.g. Reddit, paywalled): use a
  fallback skill (e.g. reddit-fetch in `~/.claude/skills/` or dx plugin) or
  Gemini CLI. Document the chosen method here or in store.md.

---

## System prompt slim (Tip 15)

- If using a minified CLI or custom system prompt: document the procedure (e.g.
  patch script, `system-prompt/` directory) locally. Do not add to repo without
  todo doc update.

---

## Clone / half-clone (Tip 23)

- For long conversations: use a clone or half-clone script/skill to compact
  context. Optionally suggest `/half-clone` when context exceeds a threshold.
  Reference in tool docs.

---

## Context review (Tip 30)

- When reviewing store.md: use recent conversations to propose new lines
  (repeated instructions → candidates for store.md). Optionally use a review
  skill (e.g. review-claudemd) if available.

---

## Approved commands audit (Tip 33)

- Run **cc-safe** (or equivalent) on a schedule: e.g. `npx cc-safe .` before
  opening a PR or monthly. See store.md §7.

---

## Containers for long-running risky tasks (Tip 21)

- For long-running or risky work (e.g. research,
  `--dangerously-skip-permissions`): prefer running in a container so failures
  are isolated. See store.md §8 for long-running jobs; use a container when the
  task is both long and permission-heavy.

---

## Interactive PR reviews (Tip 26)

- Use `gh pr view` and `gh pr diff` (store.md §7) for step-by-step or
  file-by-file review. Ask the agent to run tests where relevant and to
  summarize findings. Interactive back-and-forth beats one-shot review.

---

## GitHub Actions / DevOps (Tip 29)

- Before push: run `deno task pre-push` (same checks as CI) to avoid CI failures
  (store.md §5, §7).
- For CI failures: use `gh run view` and logs to find root cause or flakiness
  (store.md §7). If using Claude with dx plugin, `/dx:gha <GitHub Actions URL>`
  can automate investigation and suggest fixes.

---

## Background bash and subagents (Tip 36)

- Long-running commands: run in background (e.g. Ctrl+B in Claude Code) and have
  the agent check later or use exponential backoff (store.md §8). When using
  subagents, run heavy or parallel analysis in background so the main session
  stays responsive.

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

---

# Optional tips (not adopted)

These [claude-code-tips](https://github.com/ykdojo/claude-code-tips) are **not**
adopted as project practice. They are listed here for optional reference. When
the team agrees to adopt one, add it to this guide or to
`shared/prompt/store.md` as appropriate.

---

## Tip 2: Talk to Claude Code with your voice

Use a local voice transcription system (e.g. superwhisper, MacWhisper, or
open-source alternatives) to speak instead of typing. Claude can interpret minor
transcription errors. Whispering with earphones works in shared spaces and even
on a plane. Faster input for many users.

---

## Tip 12: Invest in your own workflow

Spend some time on the tools you use: keep CLAUDE.md (or project context)
concise and goal-oriented, learn a few key tips and features, and tune your
environment. You don't need to build everything from scratch—small investments
(aliases, one or two scripts) pay off.

---

## Tip 13: Search through your conversation history

Conversations are stored under `~/.claude/projects/` (folder names derived from
project path). You can search with `grep`/`find`/`jq` on the `.jsonl` files, or
ask Claude to search for you (e.g. "What did we discuss about X?"). Useful for
recalling past decisions or context.

---

## Tip 14: Multitasking with terminal tabs

When running multiple sessions, stay organized: e.g. at most three or four
tasks, open new tabs on the right, and sweep left-to-right from oldest to
newest. A simple "cascade" helps more than any specific technical setup.

---

## Tip 18: Claude Code as a writing assistant

Use it for drafts: give context and instructions (voice works well), get a first
draft, then revise line-by-line with the agent. Terminal on one side and editor
on the other works well for this back-and-forth.

---

## Tip 22: The best way to get better is by using it

Like "get better at rock climbing by rock climbing." Use the tool regularly;
tips and docs help, but practice builds intuition. Think of it as a "billion
token rule": more usage (within your budget) improves feel for how the system
behaves.

---

## Tip 25: CLAUDE.md vs Skills vs Slash Commands vs Plugins

- **CLAUDE.md**: Loaded at the start of every conversation; simple, always
  present.
- **Skills**: Structured instructions loaded when relevant or when invoked (e.g.
  `/my-skill`); more token-efficient than putting everything in CLAUDE.md.
- **Slash commands**: User- or agent-invoked; good for precise, on-demand
  actions. (Skills and slash commands have merged in recent Claude Code.)
- **Plugins**: Bundle skills, commands, agents, hooks, MCP servers; easier to
  install and share (e.g. dx plugin).

---

## Tip 27: Claude Code as a research tool

Use it for deep research: CI failures (e.g. via `gh`), Reddit/sentiment analysis
(e.g. Gemini CLI fallback), codebase exploration, or public info. Give it the
right access (gh, MCP, Cmd+A paste, Playwright, etc.) and clear instructions on
how to get the data.

---

## Tip 31: Claude Code as the universal interface

Treat the CLI as the first place for many digital tasks: quick edits,
video/audio (e.g. ffmpeg, Whisper), CSV analysis, storage cleanup, Docker/cache
pruning. It can suggest and run the right commands; you stay in one
conversational interface.

---

## Tip 35: Be braver in the unknown; iterative problem solving

You can tackle domains you don't know well by iterating with the agent: ask
questions, try suggested solutions, hit dead ends and pivot, and control pace
and abstraction (sometimes "what does this line do?" sometimes "explore the
codebase"). Slowing down when the first answer isn't good often leads to better
solutions.

---

## Tip 37: The era of personalized software is here

Build small tools for yourself or small projects: custom transcription, status
lines, one-off CLIs (e.g. Slack SDK instead of fighting Docker MCP), slide
decks, data viz. If it's small, you can often build it in an hour or two with
the agent.

---

## Tip 38: Navigating and editing your input box

The input box supports readline-style shortcuts: `Ctrl+A`/`Ctrl+E` (line
start/end), `Option+Left/Right` (by word), `Ctrl+W`/`Ctrl+U`/`Ctrl+K` (delete
word/to start/to end), `Ctrl+G` (open in `$EDITOR` for long text). Type `\` then
Enter for a newline. `Ctrl+V` (Mac/Linux) pastes images. Familiar if you use
bash/zsh.

---

## Tip 41: Automation of automation

When you repeat the same task or command often, automate it: put repeated
instructions in CLAUDE.md (or context), use skills or slash commands, or have
the agent write a script. The goal is to reduce repetition and make the process
more sustainable and fun.

---

## Tip 42: Share your knowledge and contribute where you can

Share what you learn (posts, internal sessions, docs); you often get useful
feedback and new ideas in return. Contributing (e.g. issues or feedback to the
tool's repo) can lead to real improvements and reinforces your own
understanding.

---

## Tip 43: Keep learning

Ask the tool itself about its features; use `/release-notes` (or equivalent) for
what's new; follow community (e.g. r/ClaudeAI) and maintainers (e.g. Ado's tips)
for workflows and updates.

---

When the team decides to adopt any of these, add the chosen practice to this
guide or to `shared/prompt/store.md` and, if needed, remove or shorten the entry
above.
