//  HTTP endpoint: review text → ontology mapping (LLM + allowlist).

import type { Context } from 'hono';
import { mapReviewTextToOntology } from './reviewMappingService.ts';
import { ReviewMappingRequestSchema } from './reviewMappingSchema.ts';

export async function postReviewMapping(c: Context) {
  const parsed = ReviewMappingRequestSchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await mapReviewTextToOntology(
    parsed.data.review_text,
  );
  return result.ok
    ? c.json({
      concept_ids: result.concept_ids,
      mapped_at: result.mapped_at,
    })
    : c.json(
      { ok: false, message: result.message },
      result.status,
    );
}
