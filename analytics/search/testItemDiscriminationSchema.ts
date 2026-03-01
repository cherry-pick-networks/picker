import { z } from 'zod';

export const TestItemDiscriminationRequestSchema = z.object(
  {
    scheme_id: z.string(),
    from: z.string().optional(),
    to: z.string().optional(),
    min_responses: z.number().int().min(0).optional(),
  },
);
export type TestItemDiscriminationRequest = z.infer<
  typeof TestItemDiscriminationRequestSchema
>;
