---
title: primer
description: Tips and usage; reference only.
---

# Tips and usage (reference only)

Optional tooling and workflows. Reference only; use if the
project adopts them.\
Nothing here is a rule or checklist; compliance is not
checked.

**Tips already in RULESET.md**: Decompose (Tip 3 → §6),
Git/gh/draft PR/worktree (Tip 4, 16 → §7), New topic → new
conversation (Tip 5 → §9), Getting output out (Tip 6 → §10),
Aliases/setup (Tip 7 → §5), Write–test cycle (Tip 9 → §6),
Cmd+A / paste (Tip 10 → §10), Exponential backoff (Tip 17 →
§8), Markdown/Notion (Tip 19, 20 → §10), realpath (Tip 24 →
§8), Verify output (Tip 28 → §6), Abstraction level (Tip 32
→ §11), TDD (Tip 34 → §6), Plan then prototype (Tip 39 →
§6), Simplify (Tip 40 → §11).

Planning:
[Claude Code guide adoption](plan-claude-code-guide-adoption.md).

---

## Slash commands (Tip 1)

- When using Claude Code: useful built-ins include `/usage`
  (rate limits), `/mcp` (MCP servers), `/stats` (usage
  graph), `/clear` (fresh conversation). See
  claude-code-tips for full list.
- **! prefix**: In Claude Code, `!` runs a shell command
  immediately (e.g. `!git status`, `!deno test`), saving
  tokens and giving quick status checks.

---

## Cursor chat commands (project)

The list below is for **Cursor** chat: typing `/` shows
these project-defined commands. For Cursor’s own docs see
[Commands](https://cursor.com/docs/context/commands). If you
use another editor or CLI, see § Using rules without Cursor.

| Command                      | Purpose                                                                  | Reference                 |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------- |
| `/rules-summary` [task-type] | List applicable RULESET.md § for the task type                           | §5, guide rules:summary   |
| `/session-goal`              | State session goal in one sentence; ensure branch is not default         | guide Session start       |
| `/pre-push`                  | Run pre-push via dev.sh (same as CI); fix and re-run if it fails         | RULESET.md §5, §7         |
| `/create-pr`                 | Create draft PR for current branch                                       | RULESET.md §7             |
| `/clean-branches`            | Leave only main locally; sync with origin/main; delete other branches    | guide (this section)      |
| `/rewrite-merge-at-boundaries` | Rewrite linear history so merges sit at type boundaries; result on new branch only | guide (this section)      |
| `/rules-check` [task-type]   | Verify change against applicable §; delegate to rules-subagent if needed | guide Subagents for rules |

For **commit-at-boundary** there is no slash command; use
the **commit-boundary** skill. Trigger by saying e.g.
“commit current changes”, “커밋해줘”, or when a logical unit
is done; for applicable rules run
`deno task rules:summary -- commit`.

Anything you type after the command name (e.g.
`/rules-summary refactor`) is passed to the model as part of
that command’s instruction.

Detailed rules stay in RULESET.md and in each command’s
`.md` under `.cursor/commands/`. This section is a summary
for humans only.

**Project context vs skills vs commands (Tip 25)** — In this
project: **RULESET.md** is the single source of truth and is
always loaded; the Rule index and `rules:summary` determine
which § apply. **.cursor/skills** are loaded by task type
when relevant (e.g. commit-boundary for commit).
**.cursor/commands** are slash commands that you or the
agent invoke (e.g. `/rules-summary`).

---

## Using rules without Cursor

You can follow the same rules and workflows from any editor
or CLI. No Cursor features required.

- **Rule text**: `sharepoint/context/RULESET.md` Part B.
- **Which § apply**: Run
  `deno task rules:summary -- <task-type>` (e.g. `refactor`,
  `feature`, `docs`). Use the Rule index in RULESET.md if
  needed.
- **Checklists and tips**:
  `sharepoint/context/config/PRIMER.md` and the
  `.cursor/skills/` directory (read the SKILL.md files as
  plain markdown).
- **Rule compliance**: For a given change, run rules:summary
  for the task type, then check the diff or path against the
  cited § (e.g. §P, §N) using RULESET.md Part B; no subagent
  required.
- **When using Cursor**: Slash commands, `.cursor/rules`,
  and agents (e.g. rules-subagent) are optional; see §
  Cursor chat commands (project) and § Subagents for rules.

---

## Status line (Tip 0)

- **Script**: `sharepoint/context/scripts/context-bar.sh`
- **Use**: Source in shell or run to print directory, git
  branch, dirty status. Integrate with PS1 or tmux status
  line if desired.
- **Example**:
  `source sharepoint/context/scripts/context-bar.sh` then use
  `_context_bar` in prompt.

---

## Handoff workflow (Tip 8)

- **When**: Before switching agent or starting a new session
  on the same long-running task.
- **Where**: `sharepoint/context/HANDOFF.md` (linked from
  README).
- **Fields**: Goal, progress, what was tried, what failed,
  next steps. New sessions attach only this file. When
  handoff is the main context, the agent outputs work plan →
  execution steps → recommended direction for the first Next
  steps item, then proceeds (see HANDOFF.md "Session start
  (for AI)").
- **Next steps format**: Bullet list; one item = one logical
  unit (one commit or one todo task); one sentence per item.
  If no required follow-up, add at least one optional or
  deferred item. For todo or dependency changes, note
  "Propose todo update first" (or similar). See RULESET.md
  §9.
- **Optional**: Use `/handoff` (e.g. dx plugin) if
  available. To trim long conversations, use `/clone` or
  `/half-clone` (or dx plugin) to copy or keep only the
  second half; combine with writing the handoff before
  starting a new session.
- **Context usage (Ado #15)**: In long sessions or when you
  see performance issues, use `/context` (or equivalent) to
  check token use, MCP usage, and conversation balance.
  Disable unused MCP servers or skills to keep context lean.

---

## §P compliance (AI workflow and plan)

**Goal**: Reduce CI failures from the function-length lint
(§P: 2–4 statements per block body) by steering AI toward a
design-first workflow and small-function patterns. See
RULESET.md §P and sharepoint/context/config/MANUAL.md (§P
pattern guide).

**Three-step workflow for AI** (RULESET.md §P): (1) Design —
list function signatures and roles only; (2) Implement — one
function at a time, with a comment stating statement count
per body; (3) Self-review — find and fix any 5+ statement or
non-exempt single-statement body.

**Patterns**: Prefer functional style (filter/map/reduce,
pipeline) and delegation; use the complex-statement
exemption (single try/catch, switch, or block-bodied if)
where it fits. Reserve `// function-length-ignore-file` for
CI/utility scripts; document the reason at the top of the
file.

**Checklist** (when implementing this plan): AI behaviour
guidelines in editor rules (e.g. Cursor .mdc) or via
rules:summary; §P pattern guide in MANUAL.md; file-level
ignore policy in RULESET.md §P; optional refactor or
ignore-for-script for specific scripts (e.g.
checkSqlFilename).

---

## Copilot API usage

Recommended call order and atomic flows. Use with
openapi.yaml and BACKLOG.md.

**Recommended call order (typical session)**

1. Profile — GET /profile/:id or POST /profile to ensure
   actor exists.
2. Progress — GET /progress/:id, PATCH /progress/:id as
   needed.
3. Schedule — GET /schedule/due, GET /schedule/plan/weekly,
   POST /schedule/items.
4. Content — POST /content/items (one per item); POST
   /content/worksheets (body: title, item_ids[]).
5. Sources / material — GET /sources, GET /sources/:id; POST
   /sources, POST /sources/:id/extract; GET
   /lexis/entries?q= or source_id=&days=.
6. Scripts / store — GET /scripts, GET /scripts/:path, POST
   /scripts/:path; POST /script/mutate for LLM-based edit.

**Worksheet creation (atomic)**\
Prefer atomic flow over composite POST
/content/worksheets/generate: (1) Resolve item IDs; (2) POST
/content/worksheets with { title, item_ids }; (3) Optionally
POST /content/worksheets/build-prompt, then POST
/content/items and pass IDs into step 2.

**Grammar items (atomic)**\
Prefer atomic flow over composite POST
/content/items/generate: (1) Use build-prompt or local
prompt for topic/context; (2) Run LLM locally; (3) For each
item, POST /content/items with the payload.

**Copilot Studio setup**: Register app in Microsoft Entra
ID; in Copilot Studio add OAuth 2.0 with Identity provider
Microsoft Entra ID; use Client ID and Tenant ID; set API
base URL and send Authorization: Bearer &lt;access_token&gt;
on every request except GET /.

---

## Phase-gated feature (RULESET.md §Q)

When implementing a **new feature** (not
refactor/docs/urgent fix), use the four-phase cycle:
requirement summary → interface design → implementation →
test/commit. Between phase 1 and 2, and between 2 and 3, the
agent stops and asks for your approval; do not proceed until
you reply (e.g. "Approve", "OK", "Proceed to next phase").
**Phase flags** (POLICY.md): Start your prompt with
`[Phase 1]`, `[Phase 2]`, or `[Phase 3]` so the agent knows
which step to run. Example: "[Phase 1] Add validation for
POST /content/worksheets. Entry: application/routes/content.ts."

---

## rules:summary — applicable rules by task

- **Command**: `deno task rules:summary -- <task-type>` (run
  from repo root).
- **Purpose**: Print the list of RULESET.md § that apply to
  the given task type, plus a one-line title per section.
  Use when you need to know which rules to follow for the
  current context.
- **Task types**: `feature` | `refactor` | `docs` | `commit`
  | `migration` | `system` | `dependency` | `sql` |
  `directory` | `all`.
- **Optional flags**: `--code`, `--docs`, `--system` to add
  those contexts' sections to the output.
- **Output**: Line "Applicable sections: §X, §Y, …" then
  each § with its title from RULESET.md Part B. Full rule
  text stays in `sharepoint/context/RULESET.md`; Rule index is
  in RULESET.md "Rule index (context → sections)".
- **Commit**: For commit procedure (message format, git
  steps), use the **commit-boundary** skill; it applies when
  task type is `commit` or when the user asks to commit.

---

## Subagents for rules

Subagents are invoked via Cursor’s delegation (e.g.
`mcp_task`). Use `mcp_task` with **codebase-explorer**
(subagent_type `explore`), **shell-runner** (`shell`), or
**compliance-verifier** (`rules-subagent`) as needed. In
other environments, run rules:summary and perform
verification or exploration yourself using RULESET.md.

| Display name           | Cursor subagent_type  | Use for |
|------------------------|------------------------|--------|
| **compliance-verifier** | rules-subagent        | Rule/§ verification, applicable § discovery, heavy or parallel verification. |
| **codebase-explorer**   | explore               | Codebase exploration, file/pattern/keyword search, structure discovery. Respect pathConfig and RULESET § structure. See `sharepoint/context/config/codebase-explorer-spec.md`. |
| **shell-runner**        | shell                 | Terminal commands (deno task, git, dev.sh). pre-push, rules:summary, clean-branches. Does not run destructive commands (RULESET.md §7). See `sharepoint/context/config/shell-runner-spec.md`. |

**Scenario 1 — Rule compliance check**: "Does this change
satisfy §P and §N?" → Delegate to **compliance-verifier**
(rules-subagent). It checks the diff or path against
RULESET.md §P, §N and returns a short list of violations or
OK. It replies with **Verdict: OK** or **Violation Found:**
plus § and location; see
`sharepoint/context/config/compliance-verifier-work-instructions.md` if defined.

**Scenario 2 — Applicable § list**: For the current path or
task type, which § apply? Prefer `deno task rules:summary --
<task-type>`; if the case is complex, **compliance-verifier**
can explore RULESET.md and the Rule index.

**Scenario 3 — Codebase exploration**: "Where are routes
registered?", "Where is getPath used?", "How does content
use identity?" → Delegate to **codebase-explorer** (explore).
It returns short summaries with paths, symbols, and
citations; no long code pastes.

**Principle**: Main agent secures "which § to apply" via
rules:summary or skills; delegate verification to
compliance-verifier, exploration to codebase-explorer, and
shell commands to shell-runner when that keeps the main
session focused.

**Verification task example** (for pre-push or "check this
patch"): Give **compliance-verifier** a task like: "Given
RULESET.md §P and §N, check that the changes in <path>
satisfy function body 2–4 statements, line length 100, and
no type-check bypass. Return a short list of violations or
OK."

---

## Session start (first message)

- **When**: Starting a new agent or chat session (e.g.
  Cursor or other AI chat) (RULESET.md §9).
- **Goal**: First message: one short sentence stating the
  session goal (RULESET.md §9 allows Korean for chat
  titles).
- **Format**: One sentence; under 15 words or ~40
  characters; state one task or one question. Add context in
  a second message if needed.
- **Templates**:
  - Task: `[todo/target] + [what to do]` — e.g.
    `Add routes to openapi.yaml and routes.ts; run todo-check`
  - Analysis: `[symptom/error] + find cause` — e.g.
    `Find why type-check-policy fails`
  - Refactor: `[target] + [direction]` — e.g.
    `Split content service functions over 100 lines`
- **Procedure**: Open new chat → state goal in one sentence
  → send; optionally rename the tab later in chat history if
  the auto-title is not ideal. If the task involves code
  changes, the agent should create a branch from the default
  branch first (or confirm the current branch is not the
  default), then proceed.
- **Rule context**: For implementation, refactor, or
  docs-editing sessions, attach `@sharepoint/context/RULESET.md`
  or `@sharepoint/context/SUMMARY.md` in the first message, or
  include `/rules-summary <task-type>` so the agent knows
  which § apply.
- **Snippet**: Use the `agent-start` snippet
  (`.vscode/cursor-session.code-snippets`) to paste the
  template and fill in the bracketed part.
- **Named sessions (Claude Code)**: To name a session use
  `/rename <name>`; resume later with `--resume <name>`.

---

## Blocked or private sites (Tip 11)

- For URLs that cannot be fetched directly (e.g. Reddit,
  paywalled): use a fallback skill (e.g. reddit-fetch in
  `~/.claude/skills/` or dx plugin) or Gemini CLI. Document
  the chosen method here or in RULESET.md.

---

## MCP and browser automation

- **MCP**: RULESET.md §8 prefers MCP for integrations. If
  the project uses MCP servers (e.g. Playwright, DB), list
  them here with install/run steps. If none are used yet,
  note: "Not in use; when we adopt MCP, document the list
  and setup here."
- **Browser automation**: When using Playwright or similar
  for E2E or scraping, document the scenario and any caveats
  (e.g. headless, timeouts, blocked sites) in a sentence or
  two here or in RULESET.md §8.

---

## System prompt slim (Tip 15)

- If using a minified CLI or custom system prompt: document
  the procedure (e.g. patch script, `system-prompt/`
  directory) locally. Do not add to repo without todo doc
  update.

---

## Clone / half-clone (Tip 23)

- For long conversations: use a clone or half-clone
  script/skill to compact context. Optionally suggest
  `/half-clone` when context exceeds a threshold. Reference
  in tool docs.

---

## Context review (Tip 30)

- When reviewing RULESET.md: use recent conversations to
  propose new lines (repeated instructions → candidates for
  RULESET.md). Optionally use a review skill (e.g.
  review-claudemd) if available.

---

## Approved commands audit (Tip 33)

- Run **cc-safe** (or equivalent) on a schedule: e.g.
  `npx cc-safe .` before opening a PR or monthly. See
  RULESET.md §7.
- **Hooks**: In Cursor or Claude Code, a PreToolUse (or
  equivalent) hook can block dangerous commands (e.g.
  `rm -rf /`, `sudo`). See claude-code-tips or official docs
  for examples; if the team adopts hooks, document links
  here.

---

## Containers for long-running risky tasks (Tip 21)

- For long-running or risky work (e.g. research,
  `--dangerously-skip-permissions`): prefer running in a
  container so failures are isolated. See RULESET.md §8
  (long-running jobs and the guideline: "prefer running in a
  container so failures are isolated"); use a container when
  the task is both long and permission-heavy.

---

## Interactive PR reviews (Tip 26)

- Use `gh pr view` and `gh pr diff` (RULESET.md §7) for
  step-by-step or file-by-file review. Ask the agent to run
  tests where relevant and to summarize findings.
  Interactive back-and-forth beats one-shot review.

---

## GitHub Actions / DevOps (Tip 29)

- Before push: run `deno task pre-push` (runs under dev.sh
  for DB env; same checks as CI) to avoid CI failures
  (RULESET.md §5, §7).
- For CI failures: use `gh run view` and logs to find root
  cause or flakiness (RULESET.md §7). If using Claude with
  dx plugin, `/dx:gha <GitHub Actions URL>` can automate
  investigation and suggest fixes.

---

## Background bash and subagents (Tip 36)

- Long-running commands: run in background (e.g. Ctrl+B in
  Claude Code) and have the agent check later or use
  exponential backoff (RULESET.md §8). When using subagents,
  run heavy or parallel analysis in background so the main
  session stays responsive. For long-running **terminal
  commands** (e.g. pre-push, full test suite), delegate to
  **shell-runner** (subagent_type `shell`) so it runs in its
  session and returns only exit code and a short summary.

---

## dx plugin (Tip 44)

- If using Claude with dx: install with
  `claude plugin install dx@ykdojo` (or marketplace). Use
  for handoff, skills, and other dx-provided commands as
  needed.

---

## Setup script (Tip 45)

- **Script**: `sharepoint/context/scripts/setup.sh`
- **Use**: Run once from repo root to make context-bar
  executable and print reminders (cc-safe, handoff path).
  Add status line to shell profile manually if desired.

---

## New project bootstrap

- To bootstrap RULESET.md and overview in a new
  (sub)project: copy and adapt from
  `sharepoint/context/RULESET.md` (e.g. §1–§5 and Rule index
  skeleton) and `sharepoint/context/CONTEXT.md`. Ensure
  `deno task rules:summary -- all` works (add the task in
  deno.json if needed). Optionally add a task `init-prompt`
  that runs a script in `sharepoint/context/scripts/` to copy
  templates.

---

## Plan mode vs YOLO (Ado #18, #19)

For **complex, multi-file, or high-regression work**, prefer
Plan mode (Shift+Tab×2 in Claude Code) so the agent plans
before editing. For **simple, isolated, or experimental**
tasks, YOLO in a container is fine. Do **not** run YOLO for
risky or long-running work on the host; use a container so
failures are isolated.

---

# Optional tips (not adopted)

These
[claude-code-tips](https://github.com/ykdojo/claude-code-tips)
are **not** adopted as project practice. They are listed
here for optional reference. When the team agrees to adopt
one, add it to this guide or to `sharepoint/context/RULESET.md`
as appropriate.

---

## Tip 2: Talk to Claude Code with your voice

Use a local voice transcription system (e.g. superwhisper,
MacWhisper, or open-source alternatives) to speak instead of
typing. Claude can interpret minor transcription errors.
Whispering with earphones works in shared spaces and even on
a plane. Faster input for many users.

---

## Tip 12: Invest in your own workflow

Spend some time on the tools you use: keep CLAUDE.md (or
project context) concise and goal-oriented, learn a few key
tips and features, and tune your environment. You don't need
to build everything from scratch—small investments (aliases,
one or two scripts) pay off.

---

## Tip 13: Search through your conversation history

Conversations are stored under `~/.claude/projects/` (folder
names derived from project path). You can search with
`grep`/`find`/`jq` on the `.jsonl` files, or ask Claude to
search for you (e.g. "What did we discuss about X?"). Useful
for recalling past decisions or context.

---

## Tip 14: Multitasking with terminal tabs

When running multiple sessions, stay organized: e.g. at most
three or four tasks, open new tabs on the right, and sweep
left-to-right from oldest to newest. A simple "cascade"
helps more than any specific technical setup.

---

## Tip 18: Claude Code as a writing assistant

Use it for drafts: give context and instructions (voice
works well), get a first draft, then revise line-by-line
with the agent. Terminal on one side and editor on the other
works well for this back-and-forth.

---

## Tip 22: The best way to get better is by using it

Like "get better at rock climbing by rock climbing." Use the
tool regularly; tips and docs help, but practice builds
intuition. Think of it as a "billion token rule": more usage
(within your budget) improves feel for how the system
behaves.

---

## Tip 25: CLAUDE.md vs Skills vs Slash Commands vs Plugins

- **CLAUDE.md**: Loaded at the start of every conversation;
  simple, always present.
- **Skills**: Structured instructions loaded when relevant
  or when invoked (e.g. `/my-skill`); more token-efficient
  than putting everything in CLAUDE.md.
- **Slash commands**: User- or agent-invoked; good for
  precise, on-demand actions. (Skills and slash commands
  have merged in recent Claude Code.)
- **Plugins**: Bundle skills, commands, agents, hooks, MCP
  servers; easier to install and share (e.g. dx plugin).

---

## Tip 27: Claude Code as a research tool

Use it for deep research: CI failures (e.g. via `gh`),
Reddit/sentiment analysis (e.g. Gemini CLI fallback),
codebase exploration, or public info. Give it the right
access (gh, MCP, Cmd+A paste, Playwright, etc.) and clear
instructions on how to get the data.

---

## Tip 31: Claude Code as the universal interface

Treat the CLI as the first place for many digital tasks:
quick edits, video/audio (e.g. ffmpeg, Whisper), CSV
analysis, storage cleanup, Docker/cache pruning. It can
suggest and run the right commands; you stay in one
conversational interface.

---

## Tip 35: Be braver in the unknown; iterative problem solving

You can tackle domains you don't know well by iterating with
the agent: ask questions, try suggested solutions, hit dead
ends and pivot, and control pace and abstraction (sometimes
"what does this line do?" sometimes "explore the codebase").
Slowing down when the first answer isn't good often leads to
better solutions.

---

## Tip 37: The era of personalized software is here

Build small tools for yourself or small projects: custom
transcription, status lines, one-off CLIs (e.g. Slack SDK
instead of fighting Docker MCP), slide decks, data viz. If
it's small, you can often build it in an hour or two with
the agent.

---

## Tip 38: Navigating and editing your input box

The input box supports readline-style shortcuts:
`Ctrl+A`/`Ctrl+E` (line start/end), `Option+Left/Right` (by
word), `Ctrl+W`/`Ctrl+U`/`Ctrl+K` (delete word/to start/to
end), `Ctrl+G` (open in `$EDITOR` for long text). Type `\`
then Enter for a newline. `Ctrl+V` (Mac/Linux) pastes
images. Familiar if you use bash/zsh.

---

## Tip 41: Automation of automation

When you repeat the same task or command often, automate it:
put repeated instructions in CLAUDE.md (or context), use
skills or slash commands, or have the agent write a script.
The goal is to reduce repetition and make the process more
sustainable and fun.

---

## Tip 42: Share your knowledge and contribute where you can

Share what you learn (posts, internal sessions, docs); you
often get useful feedback and new ideas in return.
Contributing (e.g. issues or feedback to the tool's repo)
can lead to real improvements and reinforces your own
understanding.

---

## Tip 43: Keep learning

Ask the tool itself about its features; use `/release-notes`
(or equivalent) for what's new; follow community (e.g.
r/ClaudeAI) and maintainers (e.g. Ado's tips) for workflows
and updates.

---

When the team decides to adopt any of these, add the chosen
practice to this guide or to `sharepoint/context/RULESET.md`
and, if needed, remove or shorten the entry above.
