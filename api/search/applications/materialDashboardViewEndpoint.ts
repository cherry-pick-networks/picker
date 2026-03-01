//  GET /views/source-dashboard/:id — aggregated source dashboard.

import type { Context } from 'hono';
import { getSourceDashboardView } from '#api/search/services/materialDashboardViewService.ts';

export async function getSourceDashboard(c: Context) {
  const id = c.req.param('id');
  const view = await getSourceDashboardView(id);
  if (view == null) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json(view);
}
