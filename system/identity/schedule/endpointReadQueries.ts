//  Schedule read endpoints: query parsing. Used by endpointRead.ts.

import type { Context } from 'hono';

export function getDueQuery(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const from = c.req.query('from') ?? '';
  const to = c.req.query('to') ?? '';
  return (!actorId || !from || !to)
    ? {
      err: c.json({
        error:
          'Query actor_id, from, to required (ISO datetime)',
      }, 400),
    }
    : { actorId, from, to };
}

export function getAnnualQuery(c: Context) {
  const yearStr = c.req.query('year') ?? '';
  const level = c.req.query('level') ?? undefined;
  const year = yearStr
    ? parseInt(yearStr, 10)
    : new Date().getFullYear();
  return Number.isNaN(year)
    ? {
      err: c.json(
        { error: 'Query year must be a number' },
        400,
      ),
    }
    : { level, year };
}

export function getWeeklyQuery(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const weekStart = c.req.query('week_start') ?? '';
  const level = c.req.query('level') ?? undefined;
  return (!actorId || !weekStart)
    ? {
      err: c.json({
        error:
          'Query actor_id and week_start required (ISO date)',
      }, 400),
    }
    : { actorId, weekStart, level };
}

export function parseRetentionAndRange(c: Context):
  | { err: unknown }
  | { from?: string; to?: string; retention_min?: number } {
  const retention_min = c.req.query('retention_min') != null
    ? parseFloat(c.req.query('retention_min')!)
    : undefined;
  const invalid = retention_min !== undefined &&
    (Number.isNaN(retention_min) || retention_min < 0 ||
      retention_min > 1);
  if (invalid) {
    return {
      err: c.json({
        error:
          'Query retention_min must be a number between 0 and 1',
      }, 400),
    };
  }
  return {
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
    retention_min,
  };
}

export type ReviewWarningsQueryOk = {
  actorId: string;
  from?: string;
  to?: string;
  retention_min?: number;
};

export function getReviewWarningsQuery(
  c: Context,
): { err: unknown } | ReviewWarningsQueryOk {
  const actorId = c.req.query('actor_id') ?? '';
  if (!actorId) {
    return {
      err: c.json(
        { error: 'Query actor_id required' },
        400,
      ),
    };
  }
  const range = parseRetentionAndRange(c);
  return ('err' in range && range.err)
    ? range
    : { actorId, ...range };
}

export function getItemsQuery(c: Context) {
  const actorId = c.req.query('actor_id') ?? '';
  const sourceId = c.req.query('source_id') ?? undefined;
  return !actorId
    ? {
      err: c.json(
        { error: 'Query actor_id required' },
        400,
      ),
    }
    : { actorId, sourceId };
}
