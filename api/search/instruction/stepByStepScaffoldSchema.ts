import { z } from 'zod';

export const InstructionStepByStepScaffoldRequestSchema = z
  .object({
    concept_id: z.string(),
    level: z.string().optional(),
  });
export type InstructionStepByStepScaffoldRequest = z.infer<
  typeof InstructionStepByStepScaffoldRequestSchema
>;
