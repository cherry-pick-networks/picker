---
title: plan-claude-code-guide-adoption
description: Planning doc for Claude Code guide adoption (enhancements + adoption review).
---

# Plan: Claude Code guide adoption (enhancements + adoption review)

**Repo:** picker  
**Refs:** `shared/prompt/store.md`, `shared/prompt/documentation/guide.md`  
**Goal:** Implement 7 enhancements in guide.md; phase in 6 adoption items by priority.

---

## Part A. Enhancements (implementation)

**Principle:** Keep rule text in store.md; add only **usage, tips, and references** to guide.md. Minimize duplication.

| # | Item | Where | What |
|---|------|-------|------|
| A1 | **/context X-Ray** | guide.md | New section "Context usage (Ado #15)" under § Context review or Handoff workflow. Content: In long sessions or when seeing performance issues, use `/context` to check token use, MCP usage, and conversation balance; disable unused MCP/skills. 2–3 sentences. |
| A2 | **Plan mode vs YOLO** | guide.md | New section "Plan mode vs YOLO (Ado #18, #19)" above Optional tips (not adopted). Content: Prefer Plan (Shift+Tab×2) for complex, multi-file, high-regression work; YOLO in a container is fine for simple, isolated, or experimental tasks; do not run YOLO on the host for risky work. 3–4 sentences. |
| A3 | **store.md vs Skills vs Commands** | guide.md | New section "Project context vs skills vs commands (Tip 25)" after Cursor chat commands table. Content: In this project — store.md = always loaded, single source; Rule index + rules:summary = which § apply; .cursor/skills = loaded by task type; .cursor/commands = user/agent slash invocations. One paragraph. |
| A4 | **Hooks** | guide.md | Add paragraph at end of Approved commands audit (Tip 33). Content: PreToolUse (or equivalent) hook in Cursor/Claude Code can block dangerous commands (e.g. `rm -rf /`, `sudo`); see claude-code-tips or official docs for examples; if the team adopts hooks, document links here. 2–3 sentences. |
| A5 | **Conversation clone / half-clone** | guide.md | One line after "Optional: Use `/handoff`" in Handoff workflow. Content: For long conversations use `/clone` or `/half-clone` (or dx plugin) to copy or keep only the second half; combine with writing the handoff before starting a new session. |
| A6 | **Named sessions** | guide.md | One sentence at end of Session start (first message). Content: (When using Claude Code) use `/rename <name>` to name a session; resume with `--resume <name>`. |
| A7 | **! Prefix** | guide.md | Add 1–2 sentences to Slash commands (Tip 1). Content: In Claude Code, `!` runs a shell command immediately (e.g. `!git status`, `!deno test`); saves tokens and gives quick status checks. |

**Suggested order:** A1 → A3 → A7 → A5 → A6 → A2 → A4 (no dependencies; by importance and readability).

**Output:** One updated `shared/prompt/documentation/guide.md`.  
**Check:** Skim guide.md and confirm you can find context check, Plan/YOLO, store vs skills, hooks, clone, rename, ! prefix.

---

## Part B. Adoption review (implementation)

**Principle:** Whether to adopt is decided by the team. This plan only defines what, where, and which options.

### B1. Team setup and shared workflow (top priority)

| Item | Content |
|------|---------|
| Goal | Document so that .cursor/ + store.md alone are enough for onboarding. |
| Implementation | **README** (or CONTRIBUTING): Add one paragraph under "Documentation" / "AI and tooling". "Project rules and AI usage live in `shared/prompt/store.md` (single source of truth). Usage and tips are in `shared/prompt/documentation/guide.md`. When using Cursor, see `.cursor/rules`, `.cursor/commands`, and `.cursor/skills`." |
| Option | If the root README is already heavy, add the same paragraph to `shared/README.md` or `shared/prompt/overview.md` and link from the root README. |
| Output | One README (or overview) edit. |

### B2. /init bootstrap (optional)

| Item | Content |
|------|---------|
| Goal | Quickly create store.md and overview drafts in a new (sub)project. |
| Implementation | **Script:** `shared/prompt/scripts/init-project-prompt.ts` (or `.sh`). (1) Copy store.md template (§1–§5, Rule index skeleton), (2) Ensure `deno task rules:summary -- all` can run, (3) Create overview.md skeleton. Invoke from repo root as `deno task init-prompt` or `./shared/prompt/scripts/init-project-prompt.sh`. |
| Option | Instead of a script, add a "New project bootstrap" section in guide.md: "Copy and adapt store.md and overview.md from `shared/prompt/`; rules:summary is available if deno.json has the task." |
| Output | One script + one deno.json task, or one guide.md section. |

### B3. store.md change procedure (Memory Updates)

| Item | Content |
|------|---------|
| Goal | Handle "add OOO to store.md" requests with a clear procedure. |
| Implementation | Add "Changing store.md" to **store.md §12 Maintenance** or **guide.md**. Content: (1) Keep all rule text in store.md Part B only, (2) Add/update § in line with Rule index and context mapping, (3) Propose changes for human review; agent suggests edits only, a human performs the commit. |
| Output | 2–3 sentences in store.md §12 or one section in guide.md. |

### B4. MCP and browser automation docs

| Item | Content |
|------|---------|
| Goal | When MCP/Playwright is adopted, the team follows the same procedure. |
| Implementation | **store.md §8** already has "prefer MCP". Add "MCP and browser automation" section in **guide.md** (or extend "Blocked or private sites"): (1) List MCPs used in this project (e.g. Playwright, DB) and install/run steps, (2) When using browser automation, document scenario (e.g. E2E, scraping) and 1–2 sentences of caveats. If MCP is not used, state "Not in use; when we adopt MCP, document the list and setup here." |
| Output | One section in guide.md. |

### B5. Container recommendation

| Item | Content |
|------|---------|
| Goal | Recommend running risky or long-running work in a container. |
| Implementation | Add one sentence to **store.md §8** "Long-running jobs": "For long-running or high-permission tasks (e.g. experiments with auto-approve), prefer running in a container so failures are isolated." **guide.md** "Containers for long-running risky tasks" cites this sentence. |
| Output | One sentence in store.md; guide.md keeps existing section. |

### B6. Headless/CI (review later)

| Item | Content |
|------|---------|
| Goal | Optionally generate PR summary/review with Claude Code headless. |
| Implementation | After team agreement, add a job in `.github/workflows`: checkout → (install Claude CLI if needed) → `claude -p "Summarize and review this PR"` etc., stdout → attach as PR comment. API key in secrets. |
| Output | One workflow YAML + cost/policy agreement. This plan only states: "When adopted, add 'CI and Claude Code' section to guide.md." |

---

## Part C. Implementation order and outputs

| Step | Task | Output |
|------|------|--------|
| 1 | Enhancements A1–A7 | One guide.md edit |
| 2 | B1 Team setup docs | One paragraph in README or overview |
| 3 | B3 store change procedure | store.md §12 or one guide section |
| 4 | B5 Container recommendation | One sentence in store.md §8 |
| 5 | B4 MCP docs | One guide section (when adopted) |
| 6 | B2 /init bootstrap | Script+task or one guide section (optional) |
| 7 | B6 Headless CI | Workflow + guide after team agreement (optional) |

---

## Part D. Where this plan lives

- **This plan:** Stored in `shared/prompt/documentation/plan-claude-code-guide-adoption.md`. Link from guide.md or overview.md as "Claude Code guide adoption".
- **Single source:** Rule text stays only in store.md; guide.md and this plan hold only methods, procedures, and options (consistent with store.md §12).
