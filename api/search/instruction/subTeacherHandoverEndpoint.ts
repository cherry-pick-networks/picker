import type { Context } from 'hono';
import {
  getSubTeacherHandover as buildSubTeacherHandover,
} from './subTeacherHandoverService.ts';

export async function getSubTeacherHandover(c: Context) {
  const result = await buildSubTeacherHandover({
    actor_id: c.req.query('actor_id') ?? undefined,
    level: c.req.query('level') ?? undefined,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  });
  return c.json(result);
}
