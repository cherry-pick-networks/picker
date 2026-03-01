//  Mastery threshold validation (60).

import { z } from '@hono/zod-openapi';

export const MasteryThresholdValidationQuerySchema = z
  .object({
    scheme_id: z.string().optional(),
    threshold: z.string().optional(),
  });
export type MasteryThresholdValidationQuery = z.infer<
  typeof MasteryThresholdValidationQuerySchema
>;

export const MasteryThresholdValidationResponseSchema = z
  .object({ validation: z.record(z.string(), z.unknown()) })
  .openapi('MasteryThresholdValidationResponse');
