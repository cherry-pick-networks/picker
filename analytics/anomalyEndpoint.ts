//  HTTP handler for anomaly detection API.

import type { Context } from 'hono';
import { AnomalyRequestSchema } from '#analytics/anomalySchema.ts';
import { detectAnomalies } from '#analytics/anomalyService.ts';

export async function postAnomaly(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = AnomalyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return detectAnomalies(parsed.data).then((results) =>
    c.json({ anomalies: results })
  );
}
