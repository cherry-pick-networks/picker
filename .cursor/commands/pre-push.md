# Pre-push

Run `deno task pre-push` (same checks as CI). Reference
RULESET.md §5, §7.

- If it fails: identify the cause from the output, fix the
  issues, then run again until it passes.
- Code must satisfy §P (function body 2–4 statements; async
  only when body uses await). Do not duplicate rule text;
  reference RULESET.md.
