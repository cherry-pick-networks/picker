/** Lexis entry storage (Postgres). */

import { getPg } from "#shared/infra/pg.client.ts";
import { loadSql } from "#shared/infra/sql-loader.ts";
import type { LexisEntry } from "./lexis.schema.ts";

const sqlDir = new URL("./sql/", import.meta.url);
const SQL_LIST_ENTRIES = await loadSql(
  sqlDir,
  "list_entries_by_source_and_days.sql",
);

export interface LexisEntryRow {
  source_id: string;
  entry_index: number;
  day_index: number;
  headword: string;
  meaning: string | null;
  payload: unknown;
}

// function-length-ignore — single return of mapped object (store.md §P)
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
  const r = await pg.queryObject<LexisEntryRow>(SQL_LIST_ENTRIES, [
    sourceId,
    days,
  ]);
  return r.rows.map(toEntry);
}
