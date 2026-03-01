//  POST /content/recommend/semantic-items: query → similar items.

import type { Context } from 'hono';
import { z } from 'zod';
import { recommendItems } from '#api/search/services/semanticItemService.ts';

const BodySchema = z.object({
  query: z.string().min(1),
  concept_ids: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function postContentRecommendSemanticItems(
  c: Context,
): Promise<Response> {
  const parsed = BodySchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await recommendItems(
    parsed.data.query,
    parsed.data.concept_ids,
    parsed.data.limit,
  );
  return result.ok
    ? c.json({ recommendations: result.recommendations })
    : c.json({ error: result.message }, result.status);
}
