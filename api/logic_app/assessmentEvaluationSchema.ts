//  Schemas for wrong-answer generation (51) and adaptive-next-item (52).

import { z } from '@hono/zod-openapi';

export const WrongAnswerGenerateRequestSchema = z
  .object({
    item_id: z.string().optional(),
    concept_ids: z.array(z.string()).optional(),
    count: z.number().int().min(1).max(10).optional(),
  })
  .openapi('WrongAnswerGenerateRequest');
export type WrongAnswerGenerateRequest = z.infer<
  typeof WrongAnswerGenerateRequestSchema
>;

export const WrongAnswerGenerateResponseSchema = z
  .object({ options: z.array(z.string()) })
  .openapi('WrongAnswerGenerateResponse');

export const AdaptiveNextItemRequestSchema = z
  .object({
    actor_id: z.string(),
    scheme_id: z.string(),
    exclude_item_ids: z.array(z.string()).optional(),
  })
  .openapi('AdaptiveNextItemRequest');
export type AdaptiveNextItemRequest = z.infer<
  typeof AdaptiveNextItemRequestSchema
>;

export const AdaptiveNextItemResponseSchema = z
  .object({
    item: z.record(z.string(), z.unknown()).optional(),
  })
  .openapi('AdaptiveNextItemResponse');
