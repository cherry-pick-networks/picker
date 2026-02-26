---
title: schedule-fsrs-plan
description: Weekly lesson plan via FSRS-rs and source grammar data.
---

# Schedule (FSRS-rs) + weekly lesson plan — implementation plan

## 1. Goal and scope

- **Goal**: Generate a **weekly lesson plan** using grammar data in
  `source.payload` (JSONB) and FSRS-rs for spacing.
- **Input**: actor_id, optional week range, optional level (basic | intermediate
  | advanced).
- **Output**: For that week: **new units** (first-time) and **review units**
  (FSRS due).
- **In scope**: Grammar source payload, schedule storage, FSRS-rs integration,
  weekly plan API.
- **Out of scope**: UI; same-day duplicate review policy (optional later).

## 2. Data source

- **Grammar**: `source` table, `payload` (JSONB).
  - `source_id`: book-grammar-basic | book-grammar-intermediate |
    book-grammar-advanced.
  - `payload.metadata.level`, `payload.metadata.unit_ids` (e.g. unit_1, unit_2).
  - `payload.body`: markdown content.
  - **Topic mapping**: 17 major topics (대주제) and level→unit ranges — see
    `shared/prompt/documentation/grammar-topics.md`. Curriculum order follows
    `unit_ids`; topics are for reference and optional filtering.
- **Schedule unit**: (actor_id, source_id, unit_id) = one schedule row.
- **Terminology**: "schedule item" / "(actor, unit) schedule" (no "card").

## 3. Architecture

- **Domain**: `schedule` (reference.md allowed infix, todo.md modules).
- **Cross-domain**: schedule may call **source service** only (grammar source
  list, unit_ids). No direct store imports.
- **Dependency**: schedule → source (allowed edge).

## 4. Data model

### 4.1 Table: schedule_item

- **id** (PK): UUID or composite key.
- **actor_id**, **source_id**, **unit_id** (TEXT, NOT NULL). Unique (actor_id,
  source_id, unit_id).
- **payload** (JSONB): FSRS state (d, s, last_reviewed_at, last_interval_days,
  grade_history).
- **next_due_at** (TIMESTAMPTZ).
- **created_at**, **updated_at** (TIMESTAMPTZ).
- **Index**: (actor_id, next_due_at).

**DDL**: `shared/infra/schema/07_schedule.sql`.

### 4.2 Review log (optional, Phase 2)

- Table schedule_review_log; MVP can keep only latest in payload.

## 5. FSRS-rs

- Library: e.g. `@squeakyrobot/fsrs` (or project-chosen TS package).
- **Adapter**: `system/schedule/fsrs-adapter.ts` — map schedule item state +
  review event to library input; write back next_due_at, D, S.
- **Parameters**: 21 default; optional tuning later.

## 6. Weekly plan logic

1. **Unit pool**: List grammar sources (e.g. source_id like `book-grammar-%`),
   filter by level if given; expand `payload.metadata.unit_ids` to (source_id,
   unit_id) list.
2. **Schedule state**: For each (actor_id, source_id, unit_id) load
   schedule_item or "not introduced".
3. **Review this week**: Rows where next_due_at falls in the week →
   review_units.
4. **New this week**: (source_id, unit_id) with no schedule_item yet; take first
   N by curriculum order → new_units.
5. **Response**: week_start, week_end, new_units[], review_units[].

## 7. API (proposed)

| Method | Path                       | Purpose                                                            |
| ------ | -------------------------- | ------------------------------------------------------------------ |
| GET    | /schedule/due              | actor_id, from, to → items due in range.                           |
| GET    | /schedule/plan/weekly      | actor_id, week_start (or year/week), optional level → weekly plan. |
| POST   | /schedule/items            | actor_id, source_id, unit_id → create schedule item (new).         |
| POST   | /schedule/items/:id/review | grade, optional reviewed_at → apply FSRS, update.                  |
| GET    | /schedule/items            | actor_id, optional source_id → list items.                         |

## 8. Code layout (system/schedule/)

- schedule.endpoint.ts, schedule.service.ts, schedule.store.ts,
  schedule.schema.ts, fsrs-adapter.ts.
- App config: register schedule routes; add to system/routes.ts ROUTES.

## 9. Phases

| Phase | Content                                                            |
| ----- | ------------------------------------------------------------------ |
| 0     | Docs: todo, reference, plan; ts-filename and dependency allowlist. |
| 1     | DDL 07_schedule.sql (schedule_item).                               |
| 2     | FSRS adapter; schedule store and service (CRUD, due, weekly plan). |
| 3     | Schedule endpoint and route registration.                          |

## 10. Success criteria

- Create schedule item and record reviews → next_due_at matches FSRS
  expectation.
- GET /schedule/plan/weekly returns new_units and review_units for the week.
- Schedule domain uses only source service (no store cross-import).
