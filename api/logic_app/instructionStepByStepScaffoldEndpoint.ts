import type { Context } from 'hono';
import {
  getStepByStepScaffold as buildStepByStepScaffold,
} from './instructionStepByStepScaffoldService.ts';

export async function getStepByStepScaffold(c: Context) {
  const conceptId = c.req.query('concept_id');
  if (!conceptId) {
    return c.json({ error: 'concept_id required' }, 400);
  }
  const result = await buildStepByStepScaffold({
    concept_id: conceptId,
    level: c.req.query('level') ?? undefined,
  });
  return c.json(result);
}
