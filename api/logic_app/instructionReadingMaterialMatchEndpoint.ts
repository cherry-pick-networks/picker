import type { Context } from 'hono';
import {
  getReadingMaterialMatch as buildReadingMaterialMatch,
} from './instructionReadingMaterialMatchService.ts';

export async function getReadingMaterialMatch(c: Context) {
  const conceptIds = c.req.query('concept_ids')?.split(',')
    .filter(Boolean);
  if (!conceptIds?.length) {
    return c.json({ error: 'concept_ids required' }, 400);
  }
  const limitParam = c.req.query('limit');
  return c.json(
    await buildReadingMaterialMatch({
      concept_ids: conceptIds,
      limit: limitParam
        ? parseInt(limitParam, 10)
        : undefined,
    }),
  );
}
