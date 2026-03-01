import type { Context } from 'hono';
import { buildStudyTimeRoi } from '#system/report/analytics/studyTimeRoiService.ts';

export function getStudyTimeRoi(c: Context) {
  const actorIds = c.req.query('actor_ids')?.split(',')
    .filter(Boolean);
  const schemeId = c.req.query('scheme_id');
  if (!actorIds?.length || !schemeId) {
    return c.json({
      error: 'actor_ids and scheme_id required',
    }, 400);
  }
  return buildStudyTimeRoi({
    actor_ids: actorIds,
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  }).then((r) => c.json(r));
}
