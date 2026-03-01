import { z } from 'zod';

export const MasteryTrajectoryRequestSchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type MasteryTrajectoryRequest = z.infer<
  typeof MasteryTrajectoryRequestSchema
>;
