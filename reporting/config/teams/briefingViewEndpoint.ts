//  GET /views/team-briefing/:class_id — aggregated Teams briefing view.

import type { Context } from 'hono';
import { getTeamBriefingView } from '#reporting/config/teams/briefingViewService.ts';
import { TeamBriefingViewQuerySchema } from '#reporting/config/teams/briefingViewSchema.ts';

export function getTeamBriefing(c: Context) {
  const classId = c.req.param('class_id');
  if (!classId?.trim()) {
    return c.json({ error: 'Not found' }, 404);
  }
  const query = TeamBriefingViewQuerySchema.safeParse(
      c.req.query(),
    ).success
    ? TeamBriefingViewQuerySchema.parse(c.req.query())
    : undefined;
  return getTeamBriefingView(classId, query).then((view) =>
    c.json(view)
  );
}
