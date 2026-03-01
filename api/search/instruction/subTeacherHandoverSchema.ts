import { z } from 'zod';

export const InstructionSubTeacherHandoverRequestSchema = z
  .object({
    actor_id: z.string().optional(),
    level: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  });
export type InstructionSubTeacherHandoverRequest = z.infer<
  typeof InstructionSubTeacherHandoverRequestSchema
>;
