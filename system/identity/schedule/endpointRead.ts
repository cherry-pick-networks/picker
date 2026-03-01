//  Schedule HTTP read endpoints (due, annual, weekly, warnings, items).

import type { Context } from 'hono';
import { getAnnualCurriculum } from './annualService.ts';
import {
  getAnnualQuery,
  getDueQuery,
  getItemsQuery,
  getReviewWarningsQuery,
  getWeeklyQuery,
} from './endpointReadQueries.ts';
import { listReviewWarnings } from './reviewWarningService.ts';
import { listDue, listItems } from './service.ts';
import { getWeeklyPlan } from './weeklyService.ts';

export async function getDue(c: Context) {
  const q = getDueQuery(c);
  if (q.err) return q.err;
  const items = await listDue(q.actorId, q.from, q.to);
  return c.json({ items });
}

export async function getAnnual(c: Context) {
  const q = getAnnualQuery(c);
  if (q.err) return q.err;
  const curriculum = await getAnnualCurriculum(q);
  return c.json(curriculum);
}

export async function getWeekly(c: Context) {
  const q = getWeeklyQuery(c);
  if (q.err) return q.err;
  const plan = await getWeeklyPlan(q.actorId, q.weekStart, {
    level: q.level,
  });
  return c.json(plan);
}

export async function getReviewWarnings(
  c: Context,
): Promise<Response> {
  const q = getReviewWarningsQuery(c);
  if ('err' in q) return q.err as Response;
  const warnings = await listReviewWarnings(q.actorId, {
    from: q.from,
    to: q.to,
    retention_min: q.retention_min,
  });
  return c.json({ warnings });
}

export async function getItems(c: Context) {
  const q = getItemsQuery(c);
  if (q.err) return q.err;
  const items = await listItems(q.actorId, q.sourceId);
  return c.json({ items });
}
