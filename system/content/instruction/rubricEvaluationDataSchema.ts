import { z } from 'zod';

export const InstructionRubricEvaluationDataRequestSchema =
  z.object({
    concept_id: z.string().optional(),
    type: z.string().optional(),
  });
export type InstructionRubricEvaluationDataRequest =
  z.infer<
    typeof InstructionRubricEvaluationDataRequestSchema
  >;
