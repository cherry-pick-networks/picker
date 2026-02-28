# PICKER minimal scope plan (v3) — project update

Single reference for "copilot-assisted backend only" and legacy-removal phases. Align to-do.md API
surface and openapi.yaml with this plan.

---

## 0. Recent changes reflected

- **Auth unified**: **Entra ID OAuth 2.0** only. All routes except `GET /` require
  `Authorization: Bearer <Entra access token>`; valid token yields full data.
- **Domain consolidation**: Six domains + App (Identity, Governance, Source, Mirror, Storage,
  Audit). See `shared/prompt/documentation/system-domain-identity-mirror-spec.md`.
  - **Identity**: Actors API (`/identity/actors`, `/identity/actors/:id`). Server stores actor_id,
    display_name, level, progress; list/search by name.
  - **Mirror**: Client-owned data backup/sync only. Content, lexis, schedule under `/mirror/*`.
    build-prompt removed; atomic worksheet API only.
  - **Governance**: Scripts + allowlist (data only). Source/Mirror use allowlist data, not
    Governance module.
- **OpenAPI**: Paths and schemas aligned with to-do.md API surface.
- **Source extract**: Allowlist validates concept_ids and subject_id.

---

## 1. Principles

- **Copilot-assisted**: Users talk to the copilot (local or Studio); the copilot performs work by
  calling the PICKER API. PICKER is the backend for that assistance only.
- **No legacy**: Remove APIs, modes, and UI not needed for copilot assistance. No dual modes or
  unused entry points. Auth is already a single model (Entra).

---

## 2. What PICKER does (redefined)

| Role                        | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| **Data store**              | Profile, progress, content, sources, schedule, records, lexis — single   |
|                             | source the copilot reads and writes.                                     |
| **Contract (API · schema)** | Zod, routes, to-do.md, and **openapi.yaml** define what to call and how. |
|                             | Copilot uses Entra token and follows this contract.                      |
| **Governance · validation** | Changes to shared/runtime/store and script mutate go through Governance. |
|                             | Server owns this boundary.                                               |
| **Auth · access**           | Entra ID Bearer validation. Valid token → full data (identity, source    |
|                             | meta, etc.); otherwise 401.                                              |

**Out of scope**: Full human-facing UI; legacy endpoints or dual auth kept "for later" (dual auth
already removed).

---

## 3. Design choices (current state)

### 3.1 Auth: Entra only (already applied)

- **Current**: API uses **Entra Bearer only**. Copilot (including Studio) gets token via OAuth 2.0 +
  Microsoft Entra ID and calls with `Authorization: Bearer <token>`.
- **Plan**: Keep this. Do not reintroduce agent-only keys/headers. Local/test may use
  `TEST_SKIP_ENTRA_AUTH=1` etc. as today.

### 3.2 OpenAPI · Copilot Studio

- **Current**: openapi.yaml documents Entra Bearer and Copilot Studio usage.
- **Plan**: Use **openapi.yaml** as the single reference for API contract and copilot integration.
  Keep to-do.md API table and openapi.yaml in sync when adding or changing paths/schemas.

### 3.3 UI · client

- **Choice**: Keep client/frontend to diagnostics, health, or "API server" guidance only. New
  features are API + docs only.
- **Legacy**: Remove human-facing legacy screens and flows; document that "copilot uses API only".

### 3.4 Composite APIs: atomic units

- **Choice**: Replace "multi-step in one call" APIs with atomic APIs; copilot performs workflows by
  multiple API calls.
- **Legacy**: Remove existing composite endpoints after replacing with atomic APIs + scenario docs.

### 3.5 LLM placement

- **Keep on server**: Governance, audit, script mutate, source extract then DB.
- **Review**: For the rest, choose "prompt-only return" or remove and replace with copilot-driven
  scenarios. For Lexis utterance etc., decide per phase.

---

## 4. Implementation phases

1. **Phase 0 – User · auth definition**\
   Document that API primary users are **Entra-authenticated clients** (copilot, Studio, others).
   Keep "copilot-assisted, no legacy" in to-do.md and goal.md. _(Reflected)_ Auth is single-model
   Entra.

2. **Phase 1 – API contract · OpenAPI**\
   Align paths, schemas, and security in **openapi.yaml** with to-do.md API table. Document
   **recommended call order** for copilot (e.g. profile → schedule/due → create items). Optionally
   consolidate Copilot Studio setup (Entra app, OAuth) in one place.

3. **Phase 2 – Decompose and remove composite APIs**\
   Replace composite APIs with atomic APIs, then remove the old ones. Update routes, to-do.md, and
   openapi.yaml for atomic APIs only.

4. **Phase 3 – LLM boundary**\
   Keep server LLM only for Governance, source extract, etc. For Lexis utterance and similar: choose
   keep vs "prompt-only" vs remove; then remove any legacy LLM endpoints no longer needed.

5. **Phase 4 – Client · UI**\
   Remove human-facing legacy screens. Keep client/frontend to diagnostics, health, and minimal
   guidance. State "new features = API + docs only" in store or goal. _(Reflected in store.md and
   to-do.md.)_

6. **Phase 5 – Docs · verification**\
   Finalize API list, openapi, and scenarios in docs. Use todo-check etc. to keep **docs–code** in
   sync. Verify "no legacy": no dual auth, no unused entry points. _(Reflected: run
   `deno task todo-check`, `deno task type-check-policy`; see Verification below.)_

---

## 5. LLM boundary (server)

Server-side LLM is used only where governance or persistence requires it:

- **Script mutate** (Governance): LLM edits under shared/runtime/store/.
- **Source extract**: LLM extracts concept/subject IDs; result saved to source.
- **Lexis utterance** (`GET /lexis/entries?q=`): regex first, LLM fallback; TTL cache.

Removed: content items generation (was composite; use build-prompt + local LLM +
`POST /content/items` per copilot-scenarios.md).

---

## 6. Keep vs remove

| Keep                                                                    | Reason                                        |
| ----------------------------------------------------------------------- | --------------------------------------------- |
| **Entra ID OAuth 2.0** (Bearer, authMiddleware, entra)                  | Single auth; copilot and Studio use the same. |
| Atomic CRUD (profile, progress, content, sources, schedule, kv, record) | Data the copilot reads and writes.            |
| Governance + script mutate, source extract                              | Validation and audit on server.               |
| FSRS · schedule, ontology · seed                                        | Consistent algorithm and contract.            |
| **Lexis** (entries, `q=` utterance, LLM fallback, TTL cache)            | Recent enhancement; copilot uses for lookups. |
| **openapi.yaml**                                                        | API contract and Copilot Studio reference.    |
| build-prompt etc. "prompt-only" APIs                                    | Copilot runs LLM locally.                     |

| Already removed · do not reintroduce        | Note                            |
| ------------------------------------------- | ------------------------------- |
| `X-Client: agent` / `INTERNAL_API_KEY`      | Removed with Entra-only auth.   |
| `request-context.ts`, `sensitive-redact.ts` | Removed with dual-mode cleanup. |
| "External reduced response"                 | Valid token → full data only.   |

| To remove · rework                      | Direction                                                   |
| --------------------------------------- | ----------------------------------------------------------- |
| Composite APIs (multi-step in one call) | Replace with atomic APIs, then **remove** composite.        |
| Human-facing legacy UI · flows          | Remove; keep only minimal diagnostics/guidance.             |
| Unnecessary server LLM calls            | "Prompt-only" or remove and replace with copilot scenarios. |
| Unused legacy endpoints                 | **Remove**.                                                 |

---

## 7. Summary

- **Copilot-assisted**: PICKER is the backend the copilot uses to help the user. All design follows
  this.
- **No legacy**: Dual auth and unused endpoints are largely already removed (Entra-only). Remaining
  composite APIs, UI, and unnecessary LLM are removed or reworked per the phases above.
- **Update reflected**: Auth is Entra only; OpenAPI, Lexis, and source-extract validation are
  assumed. Copilot Studio integration proceeds from openapi.yaml.

For the current API list and modules, see **shared/prompt/to-do.md**. For route contract and Copilot
Studio, see **shared/prompt/documentation/openapi.yaml**.

---

## 8. Verification (docs–code sync)

- **todo-check**: `deno task todo-check` — all routes in system/routes.ts are listed in to-do.md API
  surface.
- **type-check-policy**: `deno task type-check-policy` — no type-check bypass.
- **No legacy**: Single auth (Entra Bearer); no unused entry points; composite endpoints removed in
  favour of atomic APIs (see Phase 2).
