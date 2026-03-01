//  LLM output schema for utterance parsing (source_id, days).

import { z } from 'zod';

export const LexisUtteranceLlmOutputSchema = z.object({
  source_id: z.string(),
  days: z.array(z.number().int().min(1)),
});
export type LexisUtteranceLlmOutput = z.infer<
  typeof LexisUtteranceLlmOutputSchema
>;
