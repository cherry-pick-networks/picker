import { z } from 'zod';

export const InstructionConceptAnalogyRequestSchema = z
  .object({
    concept_id: z.string(),
    limit: z.number().int().min(1).optional(),
  });
export type InstructionConceptAnalogyRequest = z.infer<
  typeof InstructionConceptAnalogyRequestSchema
>;
