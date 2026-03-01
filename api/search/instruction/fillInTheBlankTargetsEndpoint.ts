import type { Context } from 'hono';
import {
  getFillInTheBlankTargets as buildFillInTheBlankTargets,
} from './fillInTheBlankTargetsService.ts';

export async function getFillInTheBlankTargets(c: Context) {
  const conceptId = c.req.query('concept_id');
  if (!conceptId) {
    return c.json({ error: 'concept_id required' }, 400);
  }
  const limitParam = c.req.query('limit');
  return c.json(
    await buildFillInTheBlankTargets({
      concept_id: conceptId,
      limit: limitParam
        ? parseInt(limitParam, 10)
        : undefined,
    }),
  );
}
