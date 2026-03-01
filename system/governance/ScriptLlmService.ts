//
// Governance script-domain LLM singleton. Delegates to script LLM client.
//

import { mutateViaLlm } from './scriptLlmClient.ts';
import type {
  MutateLlmInput,
  MutateLlmResult,
} from './scriptLlmClient.ts';

export type { MutateLlmInput, MutateLlmResult };

export const ScriptLlmService = {
  mutateViaLlm,
};
