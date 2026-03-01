import { z } from 'zod';

export const InstructionSlideDeckContextRequestSchema = z
  .object({
    concept_ids: z.array(z.string()).min(1),
    level: z.string().optional(),
  });
export type InstructionSlideDeckContextRequest = z.infer<
  typeof InstructionSlideDeckContextRequestSchema
>;
