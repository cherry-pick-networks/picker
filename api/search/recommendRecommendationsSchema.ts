//
// Unified recommendations API: query and response shapes.
// Response reuses CopilotRecommendation / ItemRecommendation from recommendResponseSchema.
//

import { z } from 'zod';
import type { CopilotRecommendation } from '#api/search/recommendResponseSchema.ts';
import type { ItemRecommendation } from '#api/search/recommendResponseSchema.ts';

export const IntentSchema = z.enum([
  'review',
  'practice',
  'exam_prep',
]);
export type Intent = z.infer<typeof IntentSchema>;

export const RecommendationsQuerySchema = z.object({
  actor_id: z.string().min(1),
  intent: IntentSchema,
  limit: z.coerce.number().int().min(1).max(100).optional(),
  scheme_id: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});
export type RecommendationsQuery = z.infer<
  typeof RecommendationsQuerySchema
>;

//  Common list: content chunks (Copilot) or items; discriminate by shape.
export type UnifiedRecommendation =
  | { type: 'content'; content: CopilotRecommendation }
  | { type: 'item'; content: ItemRecommendation };

export type RecommendationsResponse = {
  recommendations: UnifiedRecommendation[];
};
