//  POST /content/recommend/rag: GraphRAG — concept expansion + semantic search.

import type { Context } from 'hono';
import { z } from 'zod';
import { recommendRag } from '#api/search/services/ragService.ts';

const BodySchema = z.object({
  query: z.string().min(1),
  concept_ids: z.array(z.string()).optional(),
  expand_concepts: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// function-length-ignore — parse body + recommend + response.
export async function postContentRecommendRag(
  c: Context,
): Promise<Response> {
  const raw = await c.req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const {
    query,
    concept_ids,
    expand_concepts = false,
    limit,
  } = parsed.data;
  const result = await recommendRag(
    query,
    concept_ids,
    expand_concepts,
    limit,
  );
  if (!result.ok) {
    return c.json(
      { error: result.message },
      result.status,
    );
  }
  return c.json({
    recommendations: result.recommendations,
    ...(result.expanded_concept_ids != null && {
      expanded_concept_ids: result.expanded_concept_ids,
    }),
    ...(result.expanded_labels != null && {
      expanded_labels: result.expanded_labels,
    }),
  });
}
