# Project scope

Single source of truth for in-scope modules, API surface, and infrastructure.
Do not add modules, routes, or infra not listed here; update this doc first.

## Modules (bounded contexts)

- **governance** — verification, audit, mutation gate; API prefix `/api/gov`.
- **identity** — students, progress; student info extension (e.g. grade, school/class); API prefix `/api/identity`. Student profile uses `grade` as string (e.g. "중1", "고2"); for numeric grade (0–13) use knowledge's `parse_grade` or label map (e.g. ingest scripts' `GRADE_LABEL_TO_INT`). Profile may include **worksheet generation context** (e.g. vocabulary policy, goal accuracy, structural notes) in `preferences` for prompt assembly.
- **knowledge** — curriculum graph, BKT; grade-by-grade weekly lesson plans (grade/week → concepts or items); API prefix `/api/knowledge`. Grade level 0–13 (0=K, 1–12=초1–고3, 13=reserved). **Static data** (JSON, versioned), **single source at runtime**: **books** (English materials; four types: discourse, lexis, grammar, phonology — stored under `data/knowledge/books/`), **curriculum** (per-grade slot order with book/unit references; `data/knowledge/curriculum/{grade}.json`). Runtime resolves curriculum refs via books to lesson slots; no `plans/` at runtime. **Dynamic data**: **schedule** — slot↔date from academic year start + holiday set (KR); holiday data in `data/knowledge`. **Calendar (slot↔date) applies to grades 5–9 only** (초5–중3). Data model and IDs kept ontology-friendly for future ontology work.
- **content** — items, generator; API prefix `/api/content`. Supports **worksheet request prompt assembly**: given `GenerateWorksheetRequest` (optional `student_id`, `question_type`, `week`, `elem_slot_index`) and student context from identity, builds a single prompt string from templates in `docs/contract` and returns it (no LLM call in scope). For **elementary** (`question_type`: `elem`), uses curriculum at `data/knowledge/curriculum/{grade}.json` resolved via books and `docs/contract/document/`; requires `student_id` (for grade) and optional `week` (1-based; when omitted and grade 5–9, uses this week from calendar).
- **scout** — ingest, search client; API prefix `/api/scout`.
- **hub** — app assembly, health, routers; no separate API prefix (mounts above).

## Infrastructure (current)

- **Data layout (domain-first)**: `data/identity`, `data/knowledge` (with `curriculum/`, `books/`, and holiday data; no runtime use of `plans/`), `data/content/items`, `data/content/worksheets`, `data/scout/inbox`, `data/scout/documents`, `data/scout/parsed`, `data/scout/cache`, `data/scout/market`, `data/system` (audit, mutations, metrics). Paths in `DataPathsConfig` (`curriculum_slots`, `books`) and `ops/config/path_registry.json`. Static data (books, curriculum) in JSON; dynamic schedule from runtime computation (no required schedule DB).
- **Database**: SQLite default; override via `database_url`. Single engine in bootstrap.
- **Event bus**: in-memory (InMemoryEventBus). Subscriptions registered in bootstrap.
- **Qdrant**: optional; `qdrant_url` and `qdrant_collection` in config. Scout search uses Qdrant when `qdrant_url` and `embed_fn` are set; otherwise search returns empty. Scout ingest pipeline indexes file-based content (`.txt`) into the same collection when `ScoutIndexWriter` is injected (same `embed_fn` and collection as search).
- **Worksheet prompt templates**: templates and output-format docs live under `docs/contract`; content loads them for prompt assembly (no hardcoding in code).

## Out of scope (until added here)

- Redis, Neo4j, external message broker, Watchdog, ontology, AST mutation, MAB.
- Additional API routers or duplicate layers for the same capability.
- **LLM call for worksheet generation** (call model with assembled prompt, parse response, persist items): see backlog.
- **Async worksheet generation job** (e.g. job id, poll for result): see backlog.
