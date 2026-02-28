/** Schedule HTTP endpoints. */

import type { Context } from 'hono';
import { getAnnualCurriculum } from './scheduleAnnualService.ts';
import { createItem, listDue, listItems, recordReview, scheduleItemId } from './scheduleService.ts';
import { getWeeklyPlan } from './scheduleWeeklyService.ts';
import { CreateScheduleItemRequestSchema, ReviewRequestSchema } from './scheduleSchema.ts';

// function-length-ignore
export async function getDue(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const from = c.req.query('from') ?? '';
  const to = c.req.query('to') ?? '';
  if (!actorId || !from || !to) {
    return c.json(
      { error: 'Query actor_id, from, to required (ISO datetime)' },
      400,
    );
  }
  const items = await listDue(actorId, from, to);
  return c.json({ items });
}

// function-length-ignore
export async function getAnnual(c: Context) {
  const yearStr = c.req.query('year') ?? '';
  const level = c.req.query('level') ?? undefined;
  const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
  if (Number.isNaN(year)) {
    return c.json({ error: 'Query year must be a number' }, 400);
  }
  const curriculum = await getAnnualCurriculum({ level, year });
  return c.json(curriculum);
}

// function-length-ignore
export async function getWeekly(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const weekStart = c.req.query('week_start') ?? '';
  const level = c.req.query('level') ?? undefined;
  if (!actorId || !weekStart) {
    return c.json(
      { error: 'Query actor_id and week_start required (ISO date)' },
      400,
    );
  }
  const plan = await getWeeklyPlan(actorId, weekStart, { level });
  return c.json(plan);
}

// function-length-ignore
export async function getItems(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const sourceId = c.req.query('source_id') ?? undefined;
  if (!actorId) {
    return c.json({ error: 'Query actor_id required' }, 400);
  }
  const items = await listItems(actorId, sourceId);
  return c.json({ items });
}

// function-length-ignore
export async function postItem(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateScheduleItemRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const item = await createItem(
    parsed.data.actor_id,
    parsed.data.source_id,
    parsed.data.unit_id,
  );
  return c.json({ ...item, id: scheduleItemId(item) }, 201);
}

// function-length-ignore
export async function postReview(c: Context) {
  const id = c.req.param('id') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = ReviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const item = await recordReview(
    id,
    parsed.data.grade,
    parsed.data.reviewed_at,
  );
  if (item == null) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...item, id: scheduleItemId(item) });
}
