//  GET /views/actor-briefing/:id — aggregated actor Outlook briefing.

import type { Context } from 'hono';
import { getActorBriefingView } from './actorViewService.ts';

export async function getActorBriefing(c: Context) {
  const view = await getActorBriefingView(
    c.req.param('id'),
    c.req.query('from') || undefined,
    c.req.query('to') || undefined,
  );
  return view == null
    ? c.json({ error: 'Not found' }, 404)
    : c.json(view);
}
