//
// Identity-domain LLM singleton. Delegates to curriculum mapping client.
//

import { generateMapping } from './curriculum/mappingLlmClient.ts';
import type { MappingLlmResult } from './curriculum/mappingLlmClient.ts';

export type { MappingLlmResult };

export const IdentityLlmService = {
  generateMapping,
};
