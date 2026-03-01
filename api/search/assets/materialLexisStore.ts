//  Lexis entry storage (Postgres).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';
import type { LexisEntry } from '#api/search/configurations/materialLexisSchema.ts';

const sqlDir = new URL('./', import.meta.url);
const SQL_LIST_ENTRIES = await loadSql(
  sqlDir,
  'list_entries_by_source_and_days.sql',
);
const SQL_COUNT_BY_SOURCE = await loadSql(
  sqlDir,
  'count_lexis_entries_by_source.sql',
);
const SQL_HEADWORDS_BY_SOURCE = await loadSql(
  sqlDir,
  'list_lexis_headwords_by_source.sql',
);

export interface LexisEntryRow {
  source_id: string;
  entry_index: number;
  day_index: number;
  headword: string;
  meaning: string | null;
  payload: unknown;
}

function toEntry(row: LexisEntryRow): LexisEntry {
  return {
    source_id: row.source_id,
    entry_index: row.entry_index,
    day_index: row.day_index,
    headword: row.headword,
    meaning: row.meaning,
    payload: row.payload as Record<string, unknown> | null,
  };
}

export async function listEntriesBySourceAndDays(
  sourceId: string,
  days: number[],
): Promise<LexisEntry[]> {
  if (days.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<LexisEntryRow>(
    SQL_LIST_ENTRIES,
    [
      sourceId,
      days,
    ],
  );
  return r.rows.map(toEntry);
}

export async function countBySource(
  sourceId: string,
): Promise<number> {
  const pg = await getPg();
  const r = await pg.queryObject<{ total: number }>(
    SQL_COUNT_BY_SOURCE,
    [sourceId],
  );
  return r.rows[0]?.total ?? 0;
}

export async function getHeadwordsBySource(
  sourceId: string,
  limit: number,
): Promise<string[]> {
  const pg = await getPg();
  const r = await pg.queryObject<{ headword: string }>(
    SQL_HEADWORDS_BY_SOURCE,
    [sourceId, limit],
  );
  return r.rows.map((row) => row.headword);
}
