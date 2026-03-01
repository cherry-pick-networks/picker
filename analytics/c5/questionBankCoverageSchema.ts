import { z } from 'zod';

export const QuestionBankCoverageRequestSchema = z.object({
  scheme_id: z.string(),
  concept_ids: z.array(z.string()).optional(),
});
export type QuestionBankCoverageRequest = z.infer<
  typeof QuestionBankCoverageRequestSchema
>;
