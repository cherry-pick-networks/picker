# identity/ C2 allowlist 재분류 마이그레이션 계획 (Option B)

## 원칙
- C2 = CAF Component 2 (config, app, function, sql, log)만 identity 하위 2레벨로 사용.
- C3(actors, schedule, …)는 reference only로 유지.

## 매핑 요약

| C2 | 역할 | 대상 |
|----|------|------|
| config | 스키마·정의 | *Schema.ts, schema.ts |
| sql | 저장·쿼리 | *Store.ts, store.ts, *.sql, IdentityStores.ts |
| app | HTTP·비즈니스 로직 | *Endpoint.ts, *Service.ts, registerIdentity*.ts |
| function | LLM·비동기 | IdentityLlmService.ts, mappingLlmCall, mappingLlmClient, seed.ts |
| log | 분석·진단 | analysis 구현체(clusterService, rootCauseService, identityOpenApi 등) |

## 파일 이동 목록 (current → target)

### config
- identity/actors/profileSchema.ts → identity/config/actors/profileSchema.ts
- identity/actors/schema.ts → identity/config/actors/schema.ts
- identity/schedule/schema.ts → identity/config/schedule/schema.ts
- identity/achievement/schema.ts → identity/config/achievement/schema.ts
- identity/curriculum/mappingSchema.ts → identity/config/curriculum/mappingSchema.ts
- identity/briefing/actorViewSchema.ts → identity/config/briefing/actorViewSchema.ts
- identity/outlook/*Schema.ts (10개) → identity/config/outlook/
- identity/analysis/rootCauseSchema.ts → identity/config/analysis/rootCauseSchema.ts
- identity/analysis/clusterSchema.ts → identity/config/analysis/clusterSchema.ts

### sql
- identity/actors/profileStore.ts → identity/sql/actors/profileStore.ts
- identity/sql/get_profile.sql → identity/sql/actors/get_profile.sql
- identity/sql/set_profile.sql → identity/sql/actors/set_profile.sql
- identity/sql/list_actor_profiles.sql → identity/sql/actors/list_actor_profiles.sql
- identity/sql/get_progress.sql → identity/sql/actors/get_progress.sql
- identity/sql/set_progress.sql → identity/sql/actors/set_progress.sql
- identity/schedule/store.ts → identity/sql/schedule/store.ts
- identity/sql/get_schedule_item.sql → identity/sql/schedule/get_schedule_item.sql
- identity/sql/set_schedule_item.sql → identity/sql/schedule/set_schedule_item.sql
- identity/sql/list_due.sql → identity/sql/schedule/list_due.sql
- identity/sql/list_schedule_items_by_actor.sql → identity/sql/schedule/list_schedule_items_by_actor.sql
- identity/achievement/store.ts → identity/sql/achievement/store.ts
- identity/sql/insert_item_response.sql → identity/sql/achievement/insert_item_response.sql
- identity/sql/list_item_responses_by_actor.sql → identity/sql/achievement/list_item_responses_by_actor.sql
- identity/sql/upsert_concept_outcome.sql → identity/sql/achievement/upsert_concept_outcome.sql
- identity/sql/list_concept_outcomes_by_actor.sql → identity/sql/achievement/list_concept_outcomes_by_actor.sql
- identity/curriculum/store.ts → identity/sql/curriculum/store.ts
- identity/sql/upsert_curriculum_slot.sql → identity/sql/curriculum/upsert_curriculum_slot.sql
- identity/sql/list_curriculum_slots.sql → identity/sql/curriculum/list_curriculum_slots.sql
- identity/IdentityStores.ts → identity/sql/IdentityStores.ts

### app
- identity/registerIdentityRoutes.ts → identity/app/registerIdentityRoutes.ts
- identity/registerIdentityRoutesOutlook.ts → identity/app/registerIdentityRoutesOutlook.ts
- identity/actors/{endpoint,service,profileService,actorsServiceHelpers}.ts → identity/app/actors/
- identity/schedule/{endpoint,endpointRead,endpointWrite,endpointReadQueries,service,grammarService,weeklyService,mapperService,annualService,progressService,scheduleServiceReview,fsrsAdapter,fsrs,reviewWarningService}.ts → identity/app/schedule/
- identity/achievement/endpoint.ts → identity/app/achievement/endpoint.ts
- identity/curriculum/{mappingEndpoint,mappingService,dumpService}.ts → identity/app/curriculum/
- identity/outlook/*Endpoint.ts, *Service.ts → identity/app/outlook/
- identity/briefing/{actorViewEndpoint,actorViewService}.ts → identity/app/briefing/
- identity/analysis/{rootCauseEndpoint,clusterEndpoint}.ts → identity/app/analysis/

### function
- identity/IdentityLlmService.ts → identity/function/IdentityLlmService.ts
- identity/curriculum/{mappingLlmCall,mappingLlmClient,seed}.ts → identity/function/curriculum/

### log
- identity/analysis/{clusterService,clusterServiceHelpers,clusterServiceHelpersClusters,clusterServiceHelpersSimilarity,clusterServiceTypes,rootCauseService,identityOpenApi}.ts → identity/log/analysis/

## SQL 로딩 경로 변경
- store/profileStore: `../sql/` → `./` (같은 디렉터리 identity/sql/actors/)
- schedule/store: `../sql/` → `./` (identity/sql/schedule/)
- achievement/store: `../sql/` → `./` (identity/sql/achievement/)
- curriculum/store: `../sql/` → `./` (identity/sql/curriculum/)
- curriculum/seed (function): `../sql/` → `../../sql/curriculum/` (identity/function/curriculum/ → identity/sql/curriculum/)

## IdentityStores.ts (identity/sql/)
- import './actors/profileStore.ts' → 동일(상대경로로 identity/sql/actors/)
- import './achievement/store.ts' → identity/sql/achievement/
- import './curriculum/store.ts' → identity/sql/curriculum/
- import './schedule/store.ts' → identity/sql/schedule/

## deno.json
- "seed:curriculum": "deno run -A identity/curriculum/seed.ts" → identity/function/curriculum/seed.ts
