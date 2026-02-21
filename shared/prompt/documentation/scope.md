# Scope

Single source of truth for in-scope modules, API surface, and infrastructure.  
Do not add new modules, routes, or infrastructure unless listed here; update this file first, then implement.

---

## Modules

- **main.ts** — single entry (Hono app, KV routes, AST demo). No separate modules yet.

---

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Health / ok check |
| GET | `/kv/:key` | Read value by key from Deno KV |
| POST | `/kv` | Write key-value to Deno KV (body: `{ key, value }`) |
| GET | `/ast` | AST demo (ts-morph; in-memory sample) |

---

## Infrastructure

- **Deno KV** — built-in; no external DB, broker, or queue.
