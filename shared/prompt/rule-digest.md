---
title: rule-digest
description: Agent-context digest of always-applied rules (§C, §I, §O). Canonical text in store.md Part B.
---

# Rule digest (agent context)

This file gives the **always-applied** rule text so the agent has it in
context.\
**Canonical source**: `shared/prompt/store.md` Part B. Sync this digest when
those sections change.

---

## §C. Language

Language: English only for code, comments, docstrings, UI/log strings, docs.

---

## §I. Agent principles

Conventions: follow standard conventions (formatting, naming, structure). KISS:
prefer the simplest option; reduce complexity. Boy scout rule: leave anything
you touch cleaner than you found it. Root cause: find it; address causes, not
only symptoms. Consistency: be consistent across the project (terms, tone,
layout). Phrasing: prefer positive phrasing in docs and specs ("Do X" over "Do
not do Y"). Rule file format: one rule per block; no blank line between rules;
wrap with indent so continuation is clearly the same rule. Rule file line wrap:
break only at punctuation (;, ,) or after a complete phrase; never split a noun
phrase or parenthetical mid-phrase; meaning per line over 80 chars in rule
files. Clear rules (when adding from docs): only add to rules what satisfies all
three: (1) stateable as must/do not/only in one sentence, no prefer/recommended;
(2) concrete todo (files, symbols, or patterns named); (3) violation detectable
by static check or simple heuristic; otherwise keep in docs or as guidance only.
No speculative implementation: do not add modules, endpoints, or infrastructure
for a future phase; add only when the feature is in current todo
(shared/prompt/todo.md).

---

## §O. Answer format (options with pros and cons)

When a reply presents multiple options or alternatives, list at least one pro
and one con for each option. Keep each pro/con to one short line unless context
requires more. Omit this only when options are trivial or the user asks for no
comparison.

---

## Which § apply (task-type)

**Rule index** (summary): always → C, I, O; handoff/long session → B;
feature+code → Q, P, B, S, T, N; refactor+code → P, B, S, T, N; docs → R, D, E;
commit → A, B; migration → J, D, E, F; system → K, L, M, F; dependency → G, H;
sql → U; directory → F, D, E; seed → V, U, E.

**Get the list**: Run `deno task rules:summary -- <task-type>` (e.g. `feature`,
`refactor`, `docs`, `commit`). In Cursor you can use
`/rules-summary <task-type>`. Do this at the **start** of a code/refactor/docs
task and apply the printed § for that session.
