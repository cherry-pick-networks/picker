import type { Context } from 'hono';
import {
  getSlideDeckContext as buildSlideDeckContext,
} from './instructionSlideDeckContextService.ts';

export async function getSlideDeckContext(c: Context) {
  const conceptIds = c.req.query('concept_ids')?.split(',')
    .filter(Boolean);
  if (!conceptIds?.length) {
    return c.json({ error: 'concept_ids required' }, 400);
  }
  const result = await buildSlideDeckContext({
    concept_ids: conceptIds,
    level: c.req.query('level') ?? undefined,
  });
  return c.json(result);
}
