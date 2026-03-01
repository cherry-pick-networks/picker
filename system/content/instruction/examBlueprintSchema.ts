import { z } from 'zod';

export const InstructionExamBlueprintRequestSchema = z
  .object({
    scheme_id: z.string(),
    level: z.string().optional(),
    concept_ids: z.array(z.string()).optional(),
  });
export type InstructionExamBlueprintRequest = z.infer<
  typeof InstructionExamBlueprintRequestSchema
>;
