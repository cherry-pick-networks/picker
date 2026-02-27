---
title: source-kag-plan
description: Source data parsing and KAG build (system/source/).
---

# Plan: Source data parsing and KAG build (system/source/)

## 1. Goal

- **Before (high cost)**: Chunk long passages locally, run morphological
  analysis, extract keywords/concepts.
- **After (low cost)**: Send long source text as-is to an LLM API (e.g. 1M+
  context), request **“only the exam subject/concept IDs contained in this
  passage as a JSON array”** via Zod for parsing.
- **Effect**: Offload heavy text preprocessing to the LLM provider.

---

## 2. Scope and constraints

- **Domain**: `system/source/` (existing todo.md todo unchanged).
- **Allowed changes**: Source schema extension, new service/endpoint,
  Source-only LLM client.
- **Mutation boundary**: Only Source and KAG data change. No changes to
  `shared/runtime/store/`.
- **Infra**: Existing Postgres and `getPg()`. Add DDL under
  `shared/infra/schema/` if needed (e.g. source–concept relation table).
- **Rules**: store.md §P (2–4 line functions etc.), §N (type-check),
  reference.md system/ infix/suffix.

---

## 3. Terms

| Term           | Meaning                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source**     | One source record. Meta (existing) + **body**.                                                                                               |
| **Body**       | Long text (e.g. exam/course passage). Storage and transfer unit.                                                                             |
| **Subject ID** | Subject facet: isced/iscedf code only (e.g. `iscedf-02`, `isced-3`). See global-standards.toml. Optional.                                    |
| **Concept ID** | Exam/course concept identifier. Align with content domain `concept_id` where possible.                                                       |
| **KAG**        | Knowledge Attribute Graph. **Source ↔ subject/concept ID mapping**. Here: store and query extracted concept_ids (and subject_id) per Source. |

---

## 4. Data model

### 4.1 Source extension (extend existing payload)

- **Existing**: `source_id`, `url`, `type`, `collected_at`, `metadata`.
- **Add (proposed)**:
  - `body?: string` — passage body (raw). Used as LLM input.
  - `extracted_at?: string` — ISO 8601. Last concept extraction time.
  - `extracted_concept_ids?: string[]` — concept IDs from LLM (KAG result).
  - `extracted_subject_id?: string` — (optional) subject ID from LLM.

KAG can be implemented without a separate table: one Source row holds passage +
extracted concept/subject. A `source_concept` relation table can be Phase 2 if
“sources by concept” queries are needed.

### 4.2 LLM output schema (Zod)

- Return only subject/concept:
  - `concept_ids: string[]` (required)
  - `subject_id?: string` (optional)
- Schema name example: `SourceExtractOutputSchema` (in system/source schema).

---

## 5. API design

### 5.1 Existing API unchanged

- `GET /sources`, `GET /sources/:id`, `POST /sources` — unchanged.
- Extend schema only so `POST /sources` can accept optional `body`.

### 5.2 New API (proposed)

| Method | Path                   | Purpose                                                                                                               |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| POST   | `/sources/:id/extract` | Send this Source’s `body` to LLM, extract subject/concept IDs, save to this Source’s `extracted_*` fields and return. |

- **Request**: path param `id`. No body or optional
  `{ options?: { model?: string } }`.
- **Response 200**:
  `{ ok: true, concept_ids: string[], subject_id?: string, extracted_at: string }`.
- **Response 4xx/5xx**: `{ ok: false, status: number, body: unknown }` (same
  pattern as other mutate endpoints).
- **Precondition**: Source must have `body`. Otherwise 400 or 409.

(Phase 2: optional `POST /sources/extract` for batch extraction.)

---

## 6. Architecture

### 6.1 Flow

1. Client: `POST /sources/:id/extract`.
2. Server: Load Source, check `body` present.
3. **LLM**: Include full `body` in prompt; ask for “exam subject ID (one) and
   concept IDs (array) as JSON only”.
4. **Local**: Parse JSON with Zod `SourceExtractOutputSchema`.
5. **Save**: Update this Source’s `extracted_concept_ids`,
   `extracted_subject_id`, `extracted_at`; return 200.

### 6.2 LLM usage

- **Model**: Prefer 1M+ context (e.g. Claude, GPT-4o). Env e.g.
  `SOURCE_EXTRACT_LLM_MODEL`.
- **Structured output**: `response_format: { type: "json_object" }` (OpenAI) or
  equivalent.
- **Prompt**: System — “Return only valid JSON with keys: concept_ids (array),
  optional subject_id.” User — full passage + “Return the one exam subject ID
  and array of concept IDs for the above passage.”
- **Safety**: Single request per extract; no chunking. Enforce body length cap
  (e.g. 1M chars) on server if needed.

### 6.3 File layout (reference.md)

- `system/source/source.schema.ts` — existing schema +
  `SourceExtractOutputSchema`, extended `SourceSchema`.
- `system/source/source-extract.service.ts` —
  `extractConceptsFromSource(sourceId: string)` (or similar). Load from store →
  LLM → Zod → store update.
- `system/source/source-llm.client.ts` — Source-only LLM client.
  `extractConcepts(body: string): Promise<SourceExtractLlmResult>`. Separate
  from script LLM client.
- `system/source/source.endpoint.ts` — add `postSourceExtract(c)`. Read `:id`,
  call `extractConceptsFromSource(id)`, map response.
- `system/source/source.store.ts` — existing `getSource`/`setSource` for full
  payload; `extracted_*` are payload fields only.

---

## 7. Concept ID scheme

- **Current**: content domain uses `concept_id` as string; no concept master
  table.
- **Phase 1**: Store and expose LLM `concept_ids` as-is; validate only as string
  array (Zod).
- **Phase 2 (optional)**: Concept master or allow-list; filter/map LLM output
  before saving.

---

## 8. Tests

- **Unit**: `source-extract.service` — mock via `SOURCE_EXTRACT_LLM_MOCK`; “body
  in → fixed concept_ids/subject_id out”.
- **Unit**: `source-llm.client` — when mocked, validate schema only; no real
  API.
- **Integration/endpoint**: `POST /sources/:id/extract` 200/400/404/5xx.
- **E2E (optional)**: Create one Source, call extract, assert
  `extracted_concept_ids` persisted.

---

## 9. Environment variables

| Variable                           | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `OPENAI_API_KEY` (or provider key) | LLM calls; used only by source-llm.                     |
| `SOURCE_EXTRACT_LLM_MODEL`         | (Optional) Model for extract. Default e.g. gpt-4o.      |
| `SOURCE_EXTRACT_LLM_MOCK`          | If set in tests, return fixed JSON without calling API. |

---

## 10. Phases

| Phase  | Content                                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| **S1** | todo.md and reference: Source extended fields, `POST /sources/:id/extract`, new service/client file names. |
| **S2** | Extend `SourceSchema`, add `SourceExtractOutputSchema` (source.schema.ts).                                 |
| **S3** | Implement `source-llm.client.ts` (prompt, fetch, Zod parse, mock).                                         |
| **S4** | Implement `source-extract.service.ts` (getSource → extract → setSource).                                   |
| **S5** | Add `postSourceExtract` in source.endpoint.ts and register route.                                          |
| **S6** | Add tests; pre-push/CI green.                                                                              |

No extra DDL if KAG is only “extracted_* on Source payload”. Add
`source_concept` table later in Phase 2 if needed.

---

## 11. Risks and options

- **Long body**: If model/API token limit exceeded, return 4xx with “body too
  long”.
- **Cost**: 1M-context calls can be expensive; consider rate limit or “extract
  only manual/batch”.
- **Consistency**: Same passage may yield different concept_ids; consider
  storing “extract config” (model/prompt version) with `extracted_at` for
  reproducibility.
