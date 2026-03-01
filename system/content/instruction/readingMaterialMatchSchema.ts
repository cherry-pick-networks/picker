import { z } from 'zod';

export const InstructionReadingMaterialMatchRequestSchema =
  z.object({
    concept_ids: z.array(z.string()).min(1),
    limit: z.number().int().min(1).optional(),
  });
export type InstructionReadingMaterialMatchRequest =
  z.infer<
    typeof InstructionReadingMaterialMatchRequestSchema
  >;
