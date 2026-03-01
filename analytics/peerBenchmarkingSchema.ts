import { z } from 'zod';

export const PeerBenchmarkingRequestSchema = z.object({
  actor_id: z.string(),
  scheme_id: z.string(),
});
export type PeerBenchmarkingRequest = z.infer<
  typeof PeerBenchmarkingRequestSchema
>;
