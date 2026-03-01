import { z } from 'zod';

export const InstructionFillInTheBlankTargetsRequestSchema =
  z.object({
    concept_id: z.string(),
    limit: z.number().int().min(1).optional(),
  });
export type InstructionFillInTheBlankTargetsRequest =
  z.infer<
    typeof InstructionFillInTheBlankTargetsRequestSchema
  >;
