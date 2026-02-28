# Copilot API scenarios

Recommended call order and atomic flows for Picker API. Use with
`shared/prompt/documentation/openapi.yaml` and `shared/prompt/to-do.md`.

---

## 1. Recommended call order (typical session)

1. **Profile** — `GET /profile/:id` or `POST /profile` to ensure actor exists.
2. **Progress** — `GET /progress/:id`, `PATCH /progress/:id` as needed.
3. **Schedule** — `GET /schedule/due?actor_id=&from=&to=` for due items; `GET /schedule/plan/weekly`
   for planning; `POST /schedule/items` to create.
4. **Content** — Create items with `POST /content/items` (one per item); create worksheet with
   `POST /content/worksheets` (body: `title`, `item_ids[]`).
5. **Sources / Lexis** — `GET /sources`, `GET /sources/:id`; `POST /sources`,
   `POST /sources/:id/extract` for extraction. `GET /lexis/entries?q=` for utterance lookup or
   `source_id=&days=` for by-source listing.
6. **Scripts / store** — `GET /scripts`, `GET /scripts/:path`, `POST
   /scripts/:path` for raw
   store; `POST /script/mutate` for LLM-based edit.

---

## 2. Worksheet creation (atomic)

Prefer atomic flow over composite `POST /content/worksheets/generate`:

1. Resolve item IDs (e.g. from concepts via existing items, or from schedule/context).
2. `POST /content/worksheets` with body `{ "title": string, "item_ids": string[] }`.
3. Optionally use `POST /content/worksheets/build-prompt` to get a prompt for local LLM, then create
   items with `POST /content/items` and pass their IDs into step 2.

---

## 3. Grammar items (atomic)

Prefer atomic flow over composite `POST /content/items/generate`:

1. Use `POST /content/worksheets/build-prompt` or a local prompt to get topic/context for the LLM.
2. Run LLM locally (or use another prompt-only API if added).
3. For each generated item, `POST /content/items` with the item payload.

---

## 4. Copilot Studio setup

- Register an app in Microsoft Entra ID (Azure AD).
- In Copilot Studio, add OAuth 2.0 with Identity provider **Microsoft Entra ID**.
- Use the app’s Client ID and Tenant ID; configure redirect/scopes as needed.
- Set the API base URL and send `Authorization: Bearer <access_token>` on every request except
  `GET /`.
