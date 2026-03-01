//  GET /report/curriculum-bottleneck: same as bottlenecks for Copilot Excel.

import type { Context } from 'hono';
import { getBottleneckNodes } from '#system/report/analytics/bottleneckService.ts';

export function getCurriculumBottleneck(c: Context) {
  const actorIds = c.req.query('actor_ids')?.split(',')
    .filter(Boolean);
  const schemeId = c.req.query('scheme_id');
  if (!actorIds?.length || !schemeId) {
    return c.json({
      error: 'actor_ids and scheme_id required',
    }, 400);
  }
  return getBottleneckNodes({
    actor_ids: actorIds,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  }).then((nodes) => c.json({ nodes }));
}
