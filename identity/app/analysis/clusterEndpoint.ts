//  HTTP handler for clustering (grouping) API.

import type { Context } from 'hono';
import { ClusterRequestSchema } from '#identity/config/diagnostic_settings/clusterSchema.ts';
import { clusterActorsByOutcome } from '#identity/log/analysis/clusterService.ts';

export async function postCluster(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = ClusterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return clusterActorsByOutcome(parsed.data).then((
    result,
  ) => c.json(result));
}
