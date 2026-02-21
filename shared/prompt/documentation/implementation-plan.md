# AI-Assisted Workflow — Implementation Plan (Final)

## Relation to project rules

- **global-agent-policy** (always) and **global-directory-boundary** (on-request). See `shared/prompt/store/context.md` Part B and `cursor-rules-policy.md`.
- **§D, §E, §F**: Single AI context lives under **shared/prompt/** (prefix = shared [Scope], infix = prompt [Entity]); context in **shared/prompt/store/context.md** (suffix = store [Artifact]); max 3 levels respected.
- **§K, §L**: Scope document remains the single source of truth for **modules, API routes, and infrastructure**. This plan does **not** add modules, API, or infrastructure; it only adds **shared/prompt/** and one context file. Do not add scope-bound items without updating the scope document first.
- **§B**: Implement in one logical unit per phase; commit at each phase boundary.
- **§A**: Use that commit message format for every commit.
- **§I**: Keep the plan simple (KISS), consistent with existing conventions, and avoid speculative scope; only implement what is in current scope.
- **§G**: Do not add dependencies; use the project's official dependency list if any tooling is introduced later.
- **§C**: All content inside **shared/prompt/store/context.md** (and any other project docs) must be in **English** (code, comments, UI strings, docs).
- **§J**: This plan does not refactor existing rule files; it only adds a new directory and files. Any future rule refactor follows plan-first, create-then-delete, one migration per commit.

---

## 1. Goal

- Implement a **model- and tool-agnostic** AI-assisted workflow.
- Keep **all project rules and context in one place**: a single markdown file under **shared/prompt/** (no `docs/` for this; directory naming follows §F and §E).
- Rely on **open protocols (eCPM/MCP)** and **CLI (Git, gh, Playwright, etc.)** so the same workflow works regardless of which AI or client is used.
- Use external "tips" (e.g. claude-code-tips) only as reference; **authoritative text lives in the single context file**.

---

## 2. Core principles

| Principle | Description |
|-----------|-------------|
| Single context | One markdown file holds project description, stack, structure, run/test commands, coding rules, and AI/tool instructions. No duplicate "rule" content in tool-specific configs. |
| Reference only | Cursor Rules (or equivalent) only **reference** that file (read or cite). Other AI tools attach or pass the file path at conversation start. |
| CLI and protocol first | Prefer Git, `gh`, Playwright, MCP, etc., so the same commands and integrations work with any client that can run terminals or use MCP. |
| Minimal tool-specific config | Avoid storing project rules inside tool-specific config; keep them in the single shared file. |

---

## 3. Target paths (rule-compliant)

- **Directory**: **shared/prompt/**  
  - Prefix: **shared** (Scope).  
  - Infix: **prompt** (Entity).  
  - Complies with §F and §E; no `docs/` used for this.
- **Single context file**: **shared/prompt/store/context.md**  
  - All rules and context for AI/tools live here. Content in **English** (§C).
- **This plan**: **shared/prompt/documentation/implementation-plan.md** (suffix: documentation = Meta)  
  - Describes how to implement and maintain the workflow; does not replace the scope document for modules/API/infra.

---

## 4. Model-agnostic mapping

| Purpose | Approach |
|---------|----------|
| Project rules and context | Single file **shared/prompt/store/context.md**; each tool references or attaches it. |
| Git / PR / issues / CI | Use GitHub CLI (`gh`) and Git; any AI that can run the terminal uses the same commands. |
| Browser / web automation | Use Playwright or similar; MCP is one possible integration layer. |
| Integrations / extensions | Use MCP servers where applicable; clients that support MCP can reuse them across models. |
| Tips and workflow | Use external tips as reference only; write only the chosen habits into **shared/prompt/store/context.md**. |

---

## 5. Implementation phases

### Phase 0: Preparation

- **0.1** Confirm the single-context path: **shared/prompt/store/context.md** (no `docs/`).
- **0.2** Define how each tool will use it (Cursor: reference in Rules; other AIs: attach file or pass path at start).
- **0.3** List CLI and protocols in use (Git, `gh`, Playwright, MCP) without naming a specific model or vendor.

**Deliverable**: Path and "reference only" policy fixed; no scope-bound modules/API/infra added (§K).

---

### Phase 1: Create directory and context file

- **1.1** Create directory **shared/prompt/** (prefix + infix only; no fourth level).
- **1.2** Create **shared/prompt/store/context.md** and fill it with (in English):
  - Project purpose and stack.
  - Directory structure and naming (per §D and §E).
  - How to run, build, and test.
  - Coding and commit conventions (e.g. §A).
  - Frequently used CLI commands.
- **1.3** Add any "repeated instructions to AI" only to this file; do not duplicate that content in tool-specific configs.
- **1.4** Keep all content in **English** (§C).

**Deliverable**: **shared/prompt/store/context.md** as the single source of truth for rules and context.

---

### Phase 2: Tool-side "reference only" setup

- **2.1** **Cursor**: Configure Rules to read **shared/prompt/store/context.md** (or a short citation). Do not copy long rule text into Rules.
- **2.2** **Other AI tools**: Document that new conversations should attach **shared/prompt/store/context.md** or pass its path (e.g. in README or CONTRIBUTING).
- **2.3** Ensure that changing model or client only requires updating this one file.

**Deliverable**: Clear, minimal instructions for how each tool uses the single file.

---

### Phase 3: Development workflow (in context.md)

- **3.1** Problem decomposition: break large work into small steps; add a one-line note in **shared/prompt/store/context.md**.
- **3.2** Plan then prototype: describe "plan first, then implement" and when to use it in context.md.
- **3.3** Write–test cycle: implement, run tests, fix on failure; document this in context.md.
- **3.4** Tests / TDD: if you use "failing test first → commit → implement", state it in context.md.
- **3.5** Verification: e.g. "verify each claim and summarize in a table"; add a short line in context.md.

**Deliverable**: context.md updated with workflow rules; no new modules/API/infra (§I: no speculative implementation).

---

### Phase 4: Git, PR, CI (CLI-only)

- **4.1** Use **git** and **gh** for commits, branches, pull, PR creation; document in context.md.
- **4.2** Use draft PRs (`gh pr create --draft`), then human review before marking ready; add to context.md.
- **4.3** Use **git worktree** when working on multiple branches in parallel; document when to use it.
- **4.4** PR review: use `gh pr view`, `gh pr diff` and "file-by-file review"; document in context.md.
- **4.5** CI failure analysis: use `gh run view` and logs; document the flow in context.md.
- **4.6** Dangerous commands: document a policy to audit approved commands (e.g. `rm -rf`, `sudo`) and, if applicable, a checklist or script.

**Deliverable**: Git/PR/CI and safety policy live only in **shared/prompt/store/context.md**.

---

### Phase 5: Integrations (MCP and CLI)

- **5.1** Prefer **MCP servers** for integrations so any MCP-capable client can reuse them.
- **5.2** Browser automation: document use of Playwright (or similar) in context.md.
- **5.3** Use **realpath** (or equivalent) when referring to files outside the current tree; add a one-line note in context.md.
- **5.4** Long-running jobs: document "manual exponential backoff" (e.g. 1m, 2m, 4m) for status checks in context.md.

**Deliverable**: MCP/Playwright/path/backoff guidance in **shared/prompt/store/context.md** only.

---

### Phase 6: Context and handoff

- **6.1** New topic → new conversation; add a one-line note in context.md.
- **6.2** Handoff: use a single markdown file (e.g. **shared/prompt/documentation/handoff.md** or **HANDOFF.md** at repo root) with goal, progress, what was tried/failed, next steps. New sessions attach only that file. Document this in context.md.
- **6.3** Branching experiments: document "branch/fork conversation or record branch point in handoff" in context.md.

**Deliverable**: Handoff template and short handoff/branch rules in **shared/prompt/store/context.md**. Handoff file path and name decided (stay within directory rules if under **shared/**).

---

### Phase 7: Input and output

- **7.1** For inaccessible or private content: "select all → copy → paste" into the tool; add one line in context.md.
- **7.2** Prefer **markdown** for outputs; document any paste/export habits (e.g. via Notion) in context.md.
- **7.3** Getting output out: copy from terminal, write to file and open in editor; add a short note in context.md.

**Deliverable**: I/O habits described only in **shared/prompt/store/context.md**.

---

### Phase 8: Quality and safety

- **8.1** Choose the right level of abstraction (high-level vs file/function/deps); add to context.md.
- **8.2** Ask for simplification when needed ("why this change?" / "simplify unnecessary parts"); add to context.md.
- **8.3** Dangerous commands: keep the audit policy in context.md (and optionally a small script or checklist; no new dependencies without §G).

**Deliverable**: Quality and safety rules only in **shared/prompt/store/context.md**.

---

### Phase 9: Maintenance

- **9.1** Review **shared/prompt/store/context.md** periodically; add "repeated" instructions when they appear; document the review cadence in the file or in this plan.
- **9.2** Keep a single source of truth: all new rules and habits go into **shared/prompt/store/context.md**; do not duplicate in tool-specific configs.
- **9.3** Use external tips only as reference; write only the chosen practices into context.md.

**Deliverable**: Maintenance procedure documented (e.g. in **shared/prompt/documentation/implementation-plan.md** or at the end of context.md).

---

### Phase 10: Tips-derived additions (optional infrastructure)

These items correspond to "implementable but often missing" tips; add only what the project adopts. No new dependencies without §G; scripts under **shared/prompt/scripts/** (prefix/infix/suffix compliant) or documented as local/personal only.

- **10.1 (Tip 0 — Status line)**  
  Optional status-line script (e.g. **shared/prompt/scripts/context-bar.sh**) showing model, directory, git branch/status, token usage if available. Document how to run or source it in context.md or this plan.
- **10.2 (Tip 8 — Handoff workflow)**  
  Document **handoff workflow**: when to create/update the handoff file (e.g. before switching agent or topic), required fields (goal, progress, tried/failed, next steps), and that new sessions attach only that file. Optionally mention `/handoff` (e.g. dx plugin) if used.
- **10.3 (Tip 11 — Blocked sites fallback)**  
  Document fallback for blocked or private URLs (e.g. reddit-fetch skill or Gemini CLI). One line in context.md or **shared/prompt/documentation/tips-usage.md**.
- **10.4 (Tip 15 — System prompt slim)**  
  If applicable, document procedure to slim system prompt (e.g. minified CLI bundle or `system-prompt/` usage). Prefer local/personal only; do not add repo scripts without scope doc update (§K).
- **10.5 (Tip 23 — Clone / half-clone)**  
  Document use of clone or half-clone (script or skill) for long conversations; optionally note auto-suggest when context exceeds a threshold. Reference in context.md or tips-usage.md.
- **10.6 (Tip 30 — Context review)**  
  Add to maintenance: periodic review of context.md with **conversation-based improvement** (e.g. "repeated instructions from recent chats → candidate lines for context.md"). Optionally use a review skill (e.g. review-claudemd) if available.
- **10.7 (Tip 33 — Approved commands audit)**  
  In addition to the existing dangerous-commands policy, document running **cc-safe** (e.g. `npx cc-safe .`) or equivalent on a schedule (e.g. before PR, monthly). Keep in context.md §7 or §11.
- **10.8 (Tip 34 — Tests and TDD)**  
  State in context.md that **tests and TDD** are recommended: write tests (failing first), commit, then implement. Strengthen Phase 3.4 wording so tests + TDD cycle are explicit expectations where applicable.
- **10.9 (Tip 44 — dx plugin)**  
  Document **dx plugin** installation and use if adopted (e.g. `claude plugin install dx@ykdojo`). Place in tips-usage.md or README; reference from context.md if needed.
- **10.10 (Tip 45 — Setup script)**  
  Optional **setup.sh** (e.g. under **shared/prompt/scripts/**) to configure in one run: status line hook, cc-safe check, aliases, --fs or other flags. Document prerequisites and how to run.

**Deliverable**: Chosen tips implemented as scripts or one-line references in context.md; optional docs in **shared/prompt/documentation/tips-usage.md**. No new scope-bound modules/API/infra (§K).

---

## 6. Commit and session rules (from project rules)

- **§B**: One logical unit per commit; commit at each phase (or feature-flag) boundary before starting the next.
- **§A**: Every commit message must follow:  
  `type[(scope)]: description`  
  (imperative, lowercase; types: feat, fix, docs, chore, refactor, perf, test, ci, build).
- Do not run `git commit` unless the user asks; commits are made during the task at each boundary.

Example after implementing Phase 1:

```text
feat(shared/prompt): add single AI context file and directory
```

---

## 7. Checklist

| # | Item | Notes |
|---|------|-------|
| 1 | Path **shared/prompt/store/context.md** fixed | Single source; directory rule compliant |
| 2 | **shared/prompt/store/context.md** created with project description, stack, structure, run/test, rules (English) | §C |
| 3 | Cursor Rules reference **shared/prompt/store/context.md** only (no long copy-paste) | Done — reference-only stubs |
| 4 | Other tools: "attach shared/prompt/store/context.md or pass path" documented | One place to update |
| 5 | Git/gh/PR/CI and safety policy in **shared/prompt/store/context.md** | CLI-only, model-agnostic |
| 6 | Handoff template and path (e.g. shared/prompt/documentation/handoff.md or root HANDOFF.md) | Document in context.md |
| 7 | MCP/Playwright usage described in **shared/prompt/store/context.md** | Protocol/CLI only |
| 8 | Review cadence for **shared/prompt/store/context.md** defined | e.g. quarterly |
| 9 | (Phase 10) Status line script optional; path **shared/prompt/scripts/context-bar.sh** if used | Tip 0 |
| 10 | (Phase 10) Handoff **workflow** (when to write/update, required fields) documented | Tip 8 |
| 11 | (Phase 10) Blocked-sites fallback (e.g. reddit-fetch, Gemini CLI) one-line ref if used | Tip 11 |
| 12 | (Phase 10) Approved-commands audit: **cc-safe** (e.g. `npx cc-safe .`) and schedule in context.md | Tip 33 |
| 13 | (Phase 10) Tests + TDD cycle stated as expectation in **shared/prompt/store/context.md** | Tip 34 |
| 14 | (Phase 10) Optional **setup.sh** under **shared/prompt/scripts/**; tips-usage.md for dx, clone, etc. | Tip 45, 44, 23 |

---

## 8. Scope and dependencies (from project rules)

- **§K**: The scope document (e.g. shared/prompt/documentation/scope.md) remains the single source of truth for **modules, API routes, and infrastructure**. This plan does **not** add or change those; it only adds **shared/prompt/** and the context/handoff files. Any new module, API route, or infrastructure must still be added to the scope document first.
- **§G, §H**: Do not add dependencies for this plan. If later you add a script or tool that depends on new packages, add them to the project's official dependency list first and satisfy §H where applicable.

---

## 9. Summary

- **Rules and context**: One file, **shared/prompt/store/context.md** (English); all tools reference or attach it.
- **Paths**: **shared/prompt/** (shared = Scope, prompt = Entity); no `docs/`; compliant with §F and §E.
- **Git/PR/CI**: Use **gh** and Git; same workflow for any AI that can run the terminal.
- **Integrations**: Prefer **MCP** and **Playwright**; document usage in context.md.
- **Commits**: One unit per phase; commit message per §A.
- **Tips-derived (Phase 10)**: Optional status line, handoff workflow, cc-safe, TDD wording, setup.sh, tips-usage.md; scripts under **shared/prompt/scripts/** if used.
