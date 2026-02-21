# Format limits (Option D) — Implementation plan

## Relation to project rules

- **global-agent-policy** (always) and **global-code-format** (when editing
  `**/*.ts`, `**/*.tsx`). Rule content lives in
  `shared/prompt/store.md` §P; rules only reference it.
- **§D, §E**: New rule file `global-code-format.mdc` (Scope + Entity + Artifact).
  This plan under `shared/prompt/documentation/` (naming per §D/§E).
- **§I**: Only enforceable rules in §P (line length, file length); function
  length and indentation depth are guidance only (detectability / heuristic).
- **§B**: One logical unit per phase; commit at phase boundary. **§A** for
  commit messages.
- **§C**: All new content in English.
- **§G**: No new dependencies.
- **§K, §L**: No new modules, API routes, or infrastructure.

---

## 1. Goal

- **Enforceable**: Apply **80-character line length** and **100-line file
  length** to TypeScript/TSX as project rules (Cursor rule + store §P).
- **Guidance only**: Document **function length (aim 2–4 lines)** and
  **indentation depth (1–2 levels)** as recommendations; not strict rules.

---

## 2. Scope

| Item                    | Type     | Where        | Check              |
| ----------------------- | -------- | ------------ | ------------------ |
| Line length ≤ 80       | Rule     | Store §P     | Linter / manual    |
| File length ≤ 100       | Rule     | Store §P     | Script / manual    |
| Function length 2–4     | Guidance | Store §P     | N/A                |
| Indentation 1–2 levels  | Guidance | Store §P     | N/A                |

**In scope**: `.ts`, `.tsx` under repo (exclude node_modules, _fresh, vendor,
generated). **Out of scope**: Python; other languages (add later if needed).

---

## 3. Deliverables (done)

1. **shared/prompt/store.md**: §P. Format limits (code);
   line ≤80, file ≤100; scope TS/TSX; guidance for function length and
   indentation.
2. **.cursor/rules/global-code-format.mdc**: globs `**/*.ts`, `**/*.tsx`,
   `alwaysApply: false`, references §P.
3. **.cursor/rules/global-agent-policy.mdc**: §P added to the follow list.
4. **This plan**: `shared/prompt/documentation/shared-format-plan.md`.

Optional later: script `shared/prompt/scripts/check-format-limits.ts` and
`deno task format-check`; document in store §5.

---

## 4. Phases (executed)

| Phase | Action                                              | Commit |
| ----- | --------------------------------------------------- | ------ |
| 1     | Add §P and guidance to store.md       | docs: add §P format limits and code style guidance |
| 2     | Add global-code-format.mdc; add §P to agent policy   | chore: add Cursor rule for code format limits (§P) |
| 3     | Add this plan document                              | docs: add shared-format-plan |

---

## 5. Verification

- **§P**: Agents and humans read the store; new/edited TS/TSX respect 80 chars
  and 100 lines unless an exception is documented.
- **Cursor rule**: When editing `.ts`/`.tsx`, the rule is active; no
  duplicate rule text (reference §P only).
- **Guidance**: Function length and indentation appear as guidance only
  (“aim for”, “where practical”).

---

## 6. Exceptions and maintenance

- **Exceptions**: Long lines (e.g. long URL) or long files (e.g. single
  table/data) must be documented (comment in file or in store).
- **Future**: If Python is introduced, add a separate rule (e.g.
  `module-python-policy.mdc`) with same 80/100 and language-specific
  guidance; do not extend §P with Python syntax.
