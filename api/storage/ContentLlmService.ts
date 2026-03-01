//
// Content-domain LLM singleton: diagnose, review mapping, lexis,
// source extract, item generate. Delegates to domain LLM clients.
//

import { diagnoseMisconception } from '#api/logic_app/diagnoseLlmClient.ts';
import type { DiagnoseLlmResult } from '#api/logic_app/diagnoseLlmClient.ts';
import { mapReviewToConcepts } from '#api/logic_app/reviewMappingLlmClient.ts';
import type { ReviewMappingLlmResult } from '#api/logic_app/reviewMappingLlmClient.ts';
import { parseUtteranceWithLlm } from './catalog/lexisLlmClient.ts';
import type { LexisUtteranceLlmResult } from './catalog/lexisLlmClient.ts';
import { extractConcepts } from './catalog/sourceLlmClient.ts';
import type { SourceExtractLlmResult } from './catalog/sourceLlmClient.ts';
import { generateItemsViaLlm } from '#api/search/bankGenerateLlmClient.ts';
import type { ItemGenerateLlmResult } from '#api/search/bankGenerateLlmClient.ts';

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
