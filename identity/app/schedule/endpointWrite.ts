//  Schedule HTTP write endpoints (post item, post review).

import type { Context } from 'hono';
import {
  createItem,
  recordReview,
  scheduleItemId,
} from './service.ts';
import {
  CreateScheduleItemRequestSchema,
  ReviewRequestSchema,
} from '#identity/config/jobs/schema.ts';

async function parsePostItemBody(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateScheduleItemRequestSchema.safeParse(
    body,
  );
  return !parsed.success
    ? {
      err: c.json({ error: parsed.error.flatten() }, 400),
    }
    : { data: parsed.data };
}

export async function postItem(c: Context) {
  const parsed = await parsePostItemBody(c);
  if (parsed.err) return parsed.err;
  const item = await createItem(
    parsed.data.actor_id,
    parsed.data.source_id,
    parsed.data.unit_id,
  );
  return c.json({ ...item, id: scheduleItemId(item) }, 201);
}

async function parsePostReviewBody(c: Context) {
  const id = c.req.param('id') ?? '';
  const body = await c.req.json().catch(() => ({}));
  const parsed = ReviewRequestSchema.safeParse(body);
  return !parsed.success
    ? {
      err: c.json({ error: parsed.error.flatten() }, 400),
    }
    : { id, data: parsed.data };
}

export async function postReview(c: Context) {
  const parsed = await parsePostReviewBody(c);
  if (parsed.err) return parsed.err;
  const item = await recordReview(
    parsed.id,
    parsed.data.grade,
    parsed.data.reviewed_at,
  );
  return item == null
    ? c.json({ error: 'Not found' }, 404)
    : c.json({ ...item, id: scheduleItemId(item) });
}
