# Migration plan: TS filenames to Airbnb style (Option A)

Per store.md §J. Goal: filename = default export name; camelCase for
functions/modules; no dot in filename.

## Rule change

- **Before**: `[name].[suffix].ts` (e.g. `profileEndpoint.ts`) or kebab-only
  (e.g. `contentWorksheetInit.ts`).
- **After**: Single token camelCase (e.g. `profileEndpoint.ts`,
  `contentWorksheetInit.ts`). No dot; no hyphen in filename.

## File mapping (current → target)

### system/actor/

| Current                    | Target                     |
| -------------------------- | -------------------------- |
| profileEndpoint.ts         | profileEndpoint.ts         |
| profileService.ts          | profileService.ts          |
| profileStore.ts            | profileStore.ts            |
| profileSchema.ts           | profileSchema.ts           |
| profileTypes.ts            | profileTypes.ts            |
| profilePatchInputParser.ts | profilePatchInputParser.ts |
| progressService.ts         | progressService.ts         |

### system/identity/

| Current           | Target            |
| ----------------- | ----------------- |
| actorsEndpoint.ts | actorsEndpoint.ts |
| actorsService.ts  | actorsService.ts  |
| actorsSchema.ts   | actorsSchema.ts   |

### system/app/

| Current                        | Target                         |
| ------------------------------ | ------------------------------ |
| routesRegisterConfig.ts        | routesRegisterConfig.ts        |
| routesRegisterScriptsConfig.ts | routesRegisterScriptsConfig.ts |
| authMiddleware.ts              | authMiddleware.ts              |
| homeHandler.ts                 | homeHandler.ts                 |
| addUtil.ts                     | addUtil.ts                     |

### system/audit/

| Current         | Target          |
| --------------- | --------------- |
| auditE2eRuns.ts | auditE2eRuns.ts |

### system/concept/

| Current           | Target            |
| ----------------- | ----------------- |
| conceptStore.ts   | conceptStore.ts   |
| conceptService.ts | conceptService.ts |
| conceptSchemes.ts | conceptSchemes.ts |

### system/content/

| Current                         | Target                          |
| ------------------------------- | ------------------------------- |
| contentEndpoint.ts              | contentEndpoint.ts              |
| contentService.ts               | contentService.ts               |
| contentStore.ts                 | contentStore.ts                 |
| contentSchema.ts                | contentSchema.ts                |
| contentWorksheetService.ts      | contentWorksheetService.ts      |
| contentWorksheetInit.ts         | contentWorksheetInit.ts         |
| contentWorksheetRequest.ts      | contentWorksheetRequest.ts      |
| contentWorksheetContextTypes.ts | contentWorksheetContextTypes.ts |
| contentFacetValidation.ts       | contentFacetValidation.ts       |
| contentFrontmatterService.ts    | contentFrontmatterService.ts    |
| contentPromptService.ts         | contentPromptService.ts         |
| contentPromptLoadService.ts     | contentPromptLoadService.ts     |
| contentSchemaParseService.ts    | contentSchemaParseService.ts    |
| grammarUnitTopicsLoader.ts      | grammarUnitTopicsLoader.ts      |

### system/kv/

| Current       | Target        |
| ------------- | ------------- |
| kvEndpoint.ts | kvEndpoint.ts |
| kvStore.ts    | kvStore.ts    |

### system/lexis/

| Current                   | Target                    |
| ------------------------- | ------------------------- |
| lexisEndpoint.ts          | lexisEndpoint.ts          |
| lexisStore.ts             | lexisStore.ts             |
| lexisSchema.ts            | lexisSchema.ts            |
| lexisConfig.ts            | lexisConfig.ts            |
| lexisLlmClient.ts         | lexisLlmClient.ts         |
| lexisLlmSchema.ts         | lexisLlmSchema.ts         |
| sourceMatcherConfig.ts    | sourceMatcherConfig.ts    |
| utteranceParserService.ts | utteranceParserService.ts |
| daysParser.ts             | daysParser.ts             |

### system/record/

| Current                  | Target                   |
| ------------------------ | ------------------------ |
| identityIndexEndpoint.ts | identityIndexEndpoint.ts |
| identityIndexStore.ts    | identityIndexStore.ts    |
| tomlService.ts           | tomlService.ts           |

### system/schedule/

| Current                   | Target                    |
| ------------------------- | ------------------------- |
| scheduleEndpoint.ts       | scheduleEndpoint.ts       |
| scheduleService.ts        | scheduleService.ts        |
| scheduleStore.ts          | scheduleStore.ts          |
| scheduleSchema.ts         | scheduleSchema.ts         |
| scheduleAnnualService.ts  | scheduleAnnualService.ts  |
| scheduleWeeklyService.ts  | scheduleWeeklyService.ts  |
| scheduleGrammarService.ts | scheduleGrammarService.ts |
| scheduleMapperService.ts  | scheduleMapperService.ts  |
| curriculumStore.ts        | curriculumStore.ts        |
| seedCurriculum.ts         | seedCurriculum.ts         |
| fsrsAdapter.ts            | fsrsAdapter.ts            |
| fsrs.ts                   | (unchanged)               |

### system/script/

| Current                 | Target                  |
| ----------------------- | ----------------------- |
| scriptsEndpoint.ts      | scriptsEndpoint.ts      |
| scriptsService.ts       | scriptsService.ts       |
| scriptsStore.ts         | scriptsStore.ts         |
| scriptsTypes.ts         | scriptsTypes.ts         |
| mutateEndpoint.ts       | mutateEndpoint.ts       |
| mutateService.ts        | mutateService.ts        |
| mutateSchema.ts         | mutateSchema.ts         |
| llmClient.ts            | llmClient.ts            |
| script-llm.client.ts    | scriptLlmClient.ts      |
| governanceValidation.ts | governanceValidation.ts |

### system/source/

| Current                 | Target                  |
| ----------------------- | ----------------------- |
| sourceEndpoint.ts       | sourceEndpoint.ts       |
| sourceService.ts        | sourceService.ts        |
| sourceStore.ts          | sourceStore.ts          |
| sourceSchema.ts         | sourceSchema.ts         |
| sourceExtractService.ts | sourceExtractService.ts |
| source-llm.client.ts    | sourceLlmClient.ts      |

### system/routes.ts

Unchanged (PATH_EXCEPTIONS / fixed name).

### shared/infra/

| Current                 | Target                  |
| ----------------------- | ----------------------- |
| pgClient.ts             | pgClient.ts             |
| sqlLoader.ts            | sqlLoader.ts            |
| applySchema.ts          | applySchema.ts          |
| lexisSourceKeywords.ts  | lexisSourceKeywords.ts  |
| auth/entra.ts           | (unchanged, exempt)     |
| seed/runSeedLexis.ts    | seed/runSeedLexis.ts    |
| seed/runSeedOntology.ts | seed/runSeedOntology.ts |

### shared/contract/

| Current           | Target            |
| ----------------- | ----------------- |
| allowlistData.ts  | allowlistData.ts  |
| allowlistTypes.ts | allowlistTypes.ts |

### tests/system/

| Current                       | Target                        |
| ----------------------------- | ----------------------------- |
| main_test.ts                  | (unchanged)                   |
| mainE2e_test.ts               | mainE2e_test.ts               |
| mainKv_test.ts                | mainKv_test.ts                |
| mainScripts_test.ts           | mainScripts_test.ts           |
| dbEnv_test.ts                 | dbEnv_test.ts                 |
| validator_test.ts             | (unchanged)                   |
| scriptsStore_test.ts          | scriptsStore_test.ts          |
| mutateEndpoint_test.ts        | mutateEndpoint_test.ts        |
| mutateService_test.ts         | mutateService_test.ts         |
| sourceExtractEndpoint_test.ts | sourceExtractEndpoint_test.ts |
| sourceLlmClient_test.ts       | sourceLlmClient_test.ts       |
| lexisIntegration_test.ts      | lexisIntegration_test.ts      |
| lexis-daysParser_test.ts      | lexisDaysParser_test.ts       |
| lexisLlmClient_test.ts        | lexisLlmClient_test.ts        |
| lexisSourceMatcher_test.ts    | lexisSourceMatcher_test.ts    |
| lexisUtteranceParser_test.ts  | lexisUtteranceParser_test.ts  |
| with_temp_scripts_store.ts    | (unchanged, exempt)           |

### tests/scripts/

| Current                          | Target                           |
| -------------------------------- | -------------------------------- |
| checkLineLengthHelpers_test.ts   | checkLineLengthHelpers_test.ts   |
| functionLengthLintPlugin_test.ts | functionLengthLintPlugin_test.ts |

## Execution order

1. Update store.md §E and reference.md (TS file naming).
2. Update ts-filename-check: config + validate + helpers (camelCase base name,
   no dot).
3. Rename files (git mv) in any order; then replace all import paths and
   deno.json task paths.
