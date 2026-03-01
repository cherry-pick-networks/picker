import type { Context } from 'hono';
import {
  getNextMonthPreview as buildNextMonthPreview,
} from './nextMonthPreviewService.ts';

export async function getNextMonthPreview(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildNextMonthPreview({
    actor_id: actorId,
    as_of: c.req.query('as_of') ?? undefined,
  });
  return c.json(result);
}
