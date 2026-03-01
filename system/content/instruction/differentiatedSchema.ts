import { z } from 'zod';

export const InstructionDifferentiatedRequestSchema = z
  .object({
    level: z.string(),
    concept_ids: z.array(z.string()).optional(),
    limit: z.number().int().min(1).optional(),
  });
export type InstructionDifferentiatedRequest = z.infer<
  typeof InstructionDifferentiatedRequestSchema
>;
