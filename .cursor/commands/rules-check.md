# Rules check

Verify that the current change (or the path/diff the user gives) satisfies the applicable store.md §. Reference guide.md "Subagents for rules".

1. **Applicable §**: Run `deno task rules:summary -- <task-type>`. Use the user's input after the command as task-type if provided (e.g. `refactor`, `feature`); otherwise infer from context.
2. **Check**: For the cited § (e.g. §P, §N), verify the change: function body 2–4 statements, line length 80, no type-check bypass, etc. Use store.md Part B for criteria; do not duplicate rule text.
3. **Heavy verification**: If the check is large (many files or deep analysis), use the **rules-subagent** and pass a prompt like: "Given store.md §P and §N (or the applicable §), check that the changes in <path> satisfy [criteria]. Return a short list of violations or OK."
4. **Output**: Reply with a concise summary only: a short list of violations or "OK". Do not reproduce long rule text; reference § and guide.md.
