import type { Context } from 'hono';
import {
  getConceptAnalogy as buildConceptAnalogy,
} from './conceptAnalogyService.ts';

export async function getConceptAnalogy(c: Context) {
  const conceptId = c.req.query('concept_id');
  if (!conceptId) {
    return c.json({ error: 'concept_id required' }, 400);
  }
  const limitParam = c.req.query('limit');
  return c.json(
    await buildConceptAnalogy({
      concept_id: conceptId,
      limit: limitParam
        ? parseInt(limitParam, 10)
        : undefined,
    }),
  );
}
