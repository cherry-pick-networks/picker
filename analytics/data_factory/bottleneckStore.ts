//  Report: aggregate concept outcomes for bottleneck analysis.

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL_AGG = await loadSql(
  sqlDir,
  'aggregate_concept_outcomes.sql',
);

export interface ConceptOutcomeAggRow {
  scheme_id: string;
  code: string;
  passed: boolean;
  cnt: number;
}

export async function aggregateConceptOutcomes(
  actorIds: string[],
  schemeId: string,
  from?: string,
  to?: string,
): Promise<ConceptOutcomeAggRow[]> {
  if (actorIds.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<ConceptOutcomeAggRow>(
    SQL_AGG,
    [actorIds, schemeId, from ?? null, to ?? null],
  );
  return r.rows;
}
