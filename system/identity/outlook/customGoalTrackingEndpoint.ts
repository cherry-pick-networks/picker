import type { Context } from 'hono';
import {
  getCustomGoalTracking as buildCustomGoalTracking,
} from './customGoalTrackingService.ts';

export async function getCustomGoalTracking(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  const result = await buildCustomGoalTracking({
    actor_id: actorId,
  });
  return c.json(result);
}
