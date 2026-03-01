import type { Context } from 'hono';
import {
  getDifferentiatedInstruction
    as buildDifferentiatedInstruction,
} from './differentiatedService.ts';

function parseOpts(c: Context) {
  const level = c.req.query('level');
  const limitParam = c.req.query('limit');
  return {
    level,
    concept_ids: c.req.query('concept_ids')?.split(',')
      .filter(Boolean),
    limit: limitParam
      ? parseInt(limitParam, 10)
      : undefined,
  };
}

export async function getDifferentiatedInstruction(
  c: Context,
) {
  const opts = parseOpts(c);
  if (!opts.level) {
    return c.json({ error: 'level required' }, 400);
  }
  const input = {
    level: opts.level,
    concept_ids: opts.concept_ids,
    limit: opts.limit,
  };
  return c.json(
    await buildDifferentiatedInstruction(input),
  );
}
