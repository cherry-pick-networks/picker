import type { Context } from 'hono';
import {
  getReviewWorksheetTargets as buildReviewWorksheetTargets,
} from './reviewWorksheetTargetsService.ts';

export async function getReviewWorksheetTargets(
  c: Context,
) {
  const conceptIds = c.req.query('concept_ids')?.split(',')
    .filter(Boolean);
  const result = await buildReviewWorksheetTargets({
    actor_id: c.req.query('actor_id') ?? undefined,
    concept_ids: conceptIds,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  });
  return c.json(result);
}
