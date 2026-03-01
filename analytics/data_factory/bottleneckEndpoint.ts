//  HTTP handler for bottleneck dashboard API.

import type { Context } from 'hono';
import { getBottleneckNodes } from '#analytics/data_factory/bottleneckService.ts';

function parseMinFailCount(c: Context): number | undefined {
  const m = c.req.query('min_fail_count');
  const n = m ? parseInt(m, 10) : undefined;
  return n != null && Number.isNaN(n) ? undefined : n;
}

export function getBottlenecks(c: Context) {
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
    min_fail_count: parseMinFailCount(c),
  }).then((nodes) => c.json({ nodes }));
}
