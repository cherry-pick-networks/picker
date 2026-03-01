//  GET /report/cohort-weakness-heatmap.

import type { Context } from 'hono';
import {
  buildCohortWeaknessHeatmap,
} from '#system/report/analytics/cohortWeaknessHeatmapService.ts';

export function getCohortWeaknessHeatmap(c: Context) {
  const actorIds = c.req.query('actor_ids')?.split(',')
    .filter(Boolean);
  const schemeId = c.req.query('scheme_id');
  if (!actorIds?.length || !schemeId) {
    return c.json({
      error: 'actor_ids and scheme_id required',
    }, 400);
  }
  return buildCohortWeaknessHeatmap({
    actor_ids: actorIds,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  }).then((r) => c.json(r));
}
