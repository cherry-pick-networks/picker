//  HTTP handlers for achievement (concept outcome, item response).

import type { Context } from 'hono';
import {
  RecordItemResponseBodySchema,
  UpsertConceptOutcomeBodySchema,
} from '#identity/config/roles/schema.ts';
import {
  listConceptOutcomesByActor,
  listItemResponsesByActor,
  recordItemResponse,
  upsertConceptOutcome,
} from '#identity/sql/achievement/store.ts';

export async function postConceptOutcome(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = UpsertConceptOutcomeBodySchema.safeParse(
    body,
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return upsertConceptOutcome(parsed.data).then(() =>
    c.json({ ok: true }, 200)
  );
}

function conceptOutcomeQuery(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) return null;
  return {
    actorId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  };
}

export function getConceptOutcomes(c: Context) {
  const q = conceptOutcomeQuery(c);
  if (!q) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  return listConceptOutcomesByActor(q.actorId, q.from, q.to)
    .then(
      (rows) => c.json({ outcomes: rows }),
    );
}

export async function postItemResponse(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = RecordItemResponseBodySchema.safeParse(
    body,
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  return recordItemResponse(parsed.data).then((row) =>
    c.json(row, 201)
  );
}

function itemResponseQuery(c: Context) {
  const actorId = c.req.query('actor_id');
  if (!actorId) return null;
  return {
    actorId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  };
}

export function getItemResponses(c: Context) {
  const q = itemResponseQuery(c);
  if (!q) {
    return c.json({ error: 'actor_id required' }, 400);
  }
  return listItemResponsesByActor(q.actorId, q.from, q.to)
    .then(
      (rows) => c.json({ responses: rows }),
    );
}
