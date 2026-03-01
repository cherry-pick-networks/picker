import { z } from 'zod';

export const InstructionReviewWorksheetTargetsRequestSchema =
  z.object({
    actor_id: z.string().optional(),
    concept_ids: z.array(z.string()).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type InstructionReviewWorksheetTargetsRequest =
  z.infer<
    typeof InstructionReviewWorksheetTargetsRequestSchema
  >;
