//
// Content-domain LLM singleton: diagnose, review mapping, lexis,
// source extract, item generate. Delegates to domain LLM clients.
//

import { diagnoseMisconception } from './diagnoseLlmClient.ts';
import type { DiagnoseLlmResult } from './diagnoseLlmClient.ts';
import { mapReviewToConcepts } from './reviewMappingLlmClient.ts';
import type { ReviewMappingLlmResult } from './reviewMappingLlmClient.ts';
import { parseUtteranceWithLlm } from './material/lexisLlmClient.ts';
import type { LexisUtteranceLlmResult } from './material/lexisLlmClient.ts';
import { extractConcepts } from './material/sourceLlmClient.ts';
import type { SourceExtractLlmResult } from './material/sourceLlmClient.ts';
import { generateItemsViaLlm } from './bankGenerateLlmClient.ts';
import type { ItemGenerateLlmResult } from './bankGenerateLlmClient.ts';

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
