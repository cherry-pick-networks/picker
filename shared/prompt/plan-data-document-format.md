---
# Plan: data (TOML) / document (MD + YAML FM) split. Paths and §D·§E aligned.
---

# 기획서: 데이터(TOML) / 문서(MD+YAML FM) 분할 적용 (경로·파일명 정합)

## 1. 목표 및 전제

- **목표**: 사람·AI 모두 활용 가능한 파일 포맷으로 통일하고, 확장 시 포맷·스키마
  진화를 단순하게 유지한다.
- **전제**: 기존 데이터/문서용 JSON·MD 레거시를 제거하고, 아래 규칙만 적용한
  구조로 유지한다.
- **원칙**: **데이터**는 TOML 단일 포맷, **문서**는 MD + YAML front matter(필요
  시). §D·§E는 `shared/prompt/` 문서명과 데이터 파일명에 적용한다.

---

## 2. 현재 구조 정리

### 2.1 데이터 파일 (JSON → TOML 대상)

| 경로                       | 파일명                      | 용도                                 | 참조 코드                                      |
| -------------------------- | --------------------------- | ------------------------------------ | ---------------------------------------------- |
| `shared/record/reference/` | `extracted-data-index.toml` | 추출 데이터 인덱스 (UUID → 엔트리)   | `system/record/data.store.ts`                  |
| `shared/record/reference/` | `identity-index.toml`       | identity 인덱스 (UUID → 엔트리)      | `system/record/data.store.ts`                  |
| `shared/record/store/`     | `{uuid}.toml`               | 단일 레코드 (UUID v7)                | `system/record/data.store.ts` `recordPath(id)` |
| `system/audit/`            | `e2e-runs.toml`             | E2E 런 로그 (schemaVersion + runs[]) | `system/audit/audit.log.ts`                    |

- **제외**: `deno.json`, `.vscode/settings.json` 등 설정용 JSON은 그대로 유지.

### 2.2 문서 파일 (MD, §D 적용 범위)

**shared/prompt/ (이름 규칙 적용)**

| 경로                           | 파일명         | §E suffix         | 비고                |
| ------------------------------ | -------------- | ----------------- | ------------------- |
| `shared/prompt/`               | `store.md`     | store (Artifact)  | 단일 소스 규칙      |
| `shared/prompt/`               | `boundary.md`  | boundary (Policy) | API/scope           |
| `shared/prompt/`               | `overview.md`  | overview (Meta)   |                     |
| `shared/prompt/`               | `goal.md`      | goal (Meta)       |                     |
| `shared/prompt/`               | `handoff.md`   | handoff (Meta)    |                     |
| `shared/prompt/`               | `policy.md`    | policy (Policy)   |                     |
| `shared/prompt/documentation/` | `reference.md` | reference (Meta)  | §F 허용 5개 중 하나 |
| `shared/prompt/documentation/` | `strategy.md`  | strategy (Meta)   |                     |
| `shared/prompt/documentation/` | `guide.md`     | guide (Meta)      |                     |

- §F: `shared/prompt/documentation/` 허용 suffix = reference, usage, strategy,
  guide, runbook.

**문서명 규칙 미적용 (예외)**

- 루트: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`
- `shared/README.md`, `.github/PULL_REQUEST_TEMPLATE.md`

### 2.3 Cursor 규칙 (.mdc)

- `.cursor/rules/*.mdc`: 모두 `---` YAML front matter + store.md § 참조 본문
  형태로 유지.

### 2.4 코드에서 참조하는 문서 경로 (미존재 시)

- `system/content/content-prompt-load.service.ts`: `docs/contract/` 등. 생성 시
  YAML FM + MD 본문으로 통일.

---

## 3. 포맷 규칙

### 3.1 데이터 (TOML)

| 항목   | 규칙                                                           |
| ------ | -------------------------------------------------------------- |
| 확장자 | `.toml`                                                        |
| 인코딩 | UTF-8                                                          |
| 파싱   | `@std/toml` parse; 필요 시 `@std/front-matter` `extractToml()` |
| 주석   | 스키마·필드 설명·마이그레이션 노트는 TOML 주석 허용            |
| 파일명 | §E 준수. 레코드는 `{uuid}.toml` 그대로.                        |

### 3.2 문서 (MD + YAML FM)

| 항목      | 규칙                                                                |
| --------- | ------------------------------------------------------------------- |
| 확장자    | `.md` (일반 문서), `.mdc` (Cursor 규칙)                             |
| 구조      | `---` … `---` (YAML) + 본문(Markdown)                               |
| 파싱      | `@std/front-matter` `extractYaml()` → `attrs` + `body`              |
| 적용 범위 | `shared/prompt/**/*.md` 선택 적용; `.cursor/rules/*.mdc` 기존 유지. |

---

## 4. 경로·파일명 매핑 (적용 완료)

### 4.1 데이터: 변경 후

- `shared/record/reference/extracted-data-index.toml`
- `shared/record/reference/identity-index.toml`
- `shared/record/store/<uuid>.toml`
- `system/audit/e2e-runs.toml`

### 4.2 문서

- `shared/prompt/*.md`, `shared/prompt/documentation/*.md`: 선택 시 상단 YAML FM
  추가. 본문·파일명 유지.
- `docs/contract/`: 생성 시 `*.md` + YAML FM + 본문.

---

## 5. 코드 변경 포인트 (적용 완료)

- **system/record/data.store.ts**: `.toml` 경로, `readTomlFile` 사용.
- **system/record/toml.service.ts**: `readTomlFile`, `writeTomlFile` 공용.
- **system/audit/audit.log.ts**: `e2e-runs.toml`, TOML read/write.
- **마이그레이션**: `shared/prompt/scripts/migrate-json-to-toml.ts` (1회 실행 후
  레거시 JSON 제거).

---

## 6. TOML 스키마 예시

- **extracted-data-index.toml / identity-index.toml**: `[uuid]` 테이블 또는 기존
  타입·필드 유지.
- **store/{id}.toml**: 단일 레코드 한 파일, 최상위 또는 `[record]` 표현.
- **e2e-runs.toml**: `schemaVersion` + `[[runs]]` 배열.

---

## 7. 구현 단계 (완료)

1. 의존성·공용 파서: `@std/toml` 추가, `system/record/toml.service.ts`.
2. data.store.ts: .toml 경로·파싱 전환.
3. shared/record 데이터 마이그레이션: JSON → TOML 변환·삭제.
4. audit.log.ts: e2e-runs.toml 전환.
5. (선택) 문서 YAML FM: shared/prompt/*.md 상단 FM, readDocument.
6. 정리: plan 문서, store/reference 정책 문단, 스크립트·테스트 경로 반영.

---

## 8. 작업 체크리스트

- [x] `@std/toml` 추가 및 TOML 공용 read/write 구현
- [x] `system/record/data.store.ts`: .toml 경로·파싱 전환
- [x] extracted-data-index, identity-index, store/* JSON → TOML 변환·삭제
- [x] `system/audit/audit.log.ts`: e2e-runs.toml 전환
- [x] (선택) `extractYaml` 기반 `readDocument` 및 문서용 FM 적용
- [x] (선택) `shared/prompt/*.md` 상단 YAML FM 추가
- [x] store.md에 데이터(TOML)/문서(MD+FM) 정책 반영
- [x] 스크립트·마이그레이션에서 새 경로·확장자 반영
