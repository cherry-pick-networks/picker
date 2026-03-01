import type { Context } from 'hono';
import { getWeeklyWin as buildWeeklyWin } from './weeklyWinService.ts';

export async function getWeeklyWin(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildWeeklyWin({
    actor_id: actorId,
    week_start: c.req.query('week_start') ?? undefined,
  });
  return c.json(result);
}
