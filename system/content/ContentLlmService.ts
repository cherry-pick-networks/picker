//
// Content-domain LLM singleton: diagnose, review mapping, lexis,
// source extract, item generate. Delegates to domain LLM clients.
//

import { diagnoseMisconception } from './diagnose/llmClient.ts';
import type { DiagnoseLlmResult } from './diagnose/llmClient.ts';
import { mapReviewToConcepts } from './review/mappingLlmClient.ts';
import type { ReviewMappingLlmResult } from './review/mappingLlmClient.ts';
import { parseUtteranceWithLlm } from './material/lexisLlmClient.ts';
import type { LexisUtteranceLlmResult } from './material/lexisLlmClient.ts';
import { extractConcepts } from './material/sourceLlmClient.ts';
import type { SourceExtractLlmResult } from './material/sourceLlmClient.ts';
import { generateItemsViaLlm } from './bank/generateLlmClient.ts';
import type { ItemGenerateLlmResult } from './bank/generateLlmClient.ts';

export type {
  DiagnoseLlmResult,
  ItemGenerateLlmResult,
  LexisUtteranceLlmResult,
  ReviewMappingLlmResult,
  SourceExtractLlmResult,
};

export const ContentLlmService = {
  diagnoseMisconception,
  mapReviewToConcepts,
  parseUtteranceWithLlm,
  extractConcepts,
  generateItemsViaLlm,
};
