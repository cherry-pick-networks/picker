import type { Context } from 'hono';
import {
  getExamBlueprint as buildExamBlueprint,
} from './examBlueprintService.ts';

export async function getExamBlueprint(c: Context) {
  const schemeId = c.req.query('scheme_id');
  if (!schemeId) {
    return c.json({ error: 'scheme_id required' }, 400);
  }
  const conceptIds = c.req.query('concept_ids')?.split(',')
    .filter(Boolean);
  return c.json(
    await buildExamBlueprint({
      scheme_id: schemeId,
      level: c.req.query('level') ?? undefined,
      concept_ids: conceptIds,
    }),
  );
}
