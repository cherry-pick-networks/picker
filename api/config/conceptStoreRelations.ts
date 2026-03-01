//
// Concept relation queries (neighbors, requires-predecessors/successors).
//

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_GET_NEIGHBORS = await loadSql(
  sqlDir,
  'get_concept_relation_neighbors.sql',
);
const SQL_GET_REQUIRES_PREDECESSORS = await loadSql(
  sqlDir,
  'get_concept_requires_predecessors.sql',
);
const SQL_GET_REQUIRES_SUCCESSORS = await loadSql(
  sqlDir,
  'get_concept_requires_successors.sql',
);

export async function getNeighborConceptCodes(
  codes: string[],
): Promise<string[]> {
  if (codes.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_NEIGHBORS,
    [codes],
  );
  return r.rows.map((row) => row.code);
}

export async function getRequiresPredecessors(
  codes: string[],
): Promise<string[]> {
  if (codes.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_REQUIRES_PREDECESSORS,
    [codes],
  );
  return r.rows.map((row) => row.code);
}

export async function getRequiresSuccessors(
  codes: string[],
): Promise<string[]> {
  if (codes.length === 0) return [];
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_REQUIRES_SUCCESSORS,
    [codes],
  );
  return r.rows.map((row) => row.code);
}
