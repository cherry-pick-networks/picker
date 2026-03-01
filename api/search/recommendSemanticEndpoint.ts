//  POST /content/recommend/semantic: query → similar chunks.

import type { Context } from 'hono';
import { z } from 'zod';
import { recommend } from '#api/search/recommendSemanticService.ts';

const BodySchema = z.object({
  query: z.string().min(1),
  concept_ids: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function postContentRecommendSemantic(
  c: Context,
): Promise<Response> {
  const parsed = BodySchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await recommend(
    parsed.data.query,
    parsed.data.concept_ids,
    parsed.data.limit,
  );
  return result.ok
    ? c.json({ recommendations: result.recommendations })
    : c.json({ error: result.message }, result.status);
}
