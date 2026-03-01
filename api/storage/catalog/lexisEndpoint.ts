//  Lexis HTTP: source_id+days or q (utterance) for fallback.

import type { Context } from 'hono';
import { getLexisAllowedSourceIds } from './config.ts';
import { ContentStores } from '#api/storage/ContentStores.ts';
import { parseUtteranceWithFallback } from '#api/search/services/utteranceParserService.ts';

function validateQuery(
  sourceId: string,
  days: number[],
): { error: string } | null {
  if (!sourceId.trim()) {
    return { error: 'Query source_id required' };
  }
  if (days.length === 0) {
    return {
      error: 'Query days required (comma-separated)',
    };
  }
  return null;
}

// function-length-ignore — q vs source_id/days branches.
export async function getEntries(c: Context) {
  const q = c.req.query('q')?.trim();
  if (q) {
    const parsed = await parseUtteranceWithFallback(
      q,
      getLexisAllowedSourceIds(),
    );
    if (!parsed.ok) {
      return c.json({ error: parsed.reason }, 400);
    }
    const entries = await ContentStores.lexisStore
      .listEntriesBySourceAndDays(
        parsed.source_id,
        parsed.days,
      );
    return c.json({ entries });
  }
  const sourceId = c.req.query('source_id') ?? '';
  const days = parseDaysQuery(c.req.query('days') ?? '');
  const err = validateQuery(sourceId, days);
  if (err) return c.json(err, 400);
  const entries = await ContentStores.lexisStore
    .listEntriesBySourceAndDays(
      sourceId.trim(),
      days,
    );
  return c.json({ entries });
}

function parseDaysQuery(s: string): number[] {
  const raw = s.split(',').map((x) =>
    parseInt(x.trim(), 10)
  );
  const out = raw.filter((n) =>
    Number.isInteger(n) && n >= 1
  );
  return [...new Set(out)].sort((a, b) => a - b);
}
