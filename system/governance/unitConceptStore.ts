//  Unit–concept mapping (unit_concept table): query by unit or by concept.

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_GET_CODES_BY_UNIT = await loadSql(
  sqlDir,
  'get_concept_codes_by_unit.sql',
);
const SQL_GET_UNITS_BY_CODE = await loadSql(
  sqlDir,
  'get_units_by_concept_code.sql',
);

export async function getConceptCodesByUnit(
  sourceId: string,
  unitId: string,
): Promise<string[]> {
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_CODES_BY_UNIT,
    [sourceId, unitId],
  );
  return r.rows.map((row) => row.code);
}

export interface UnitConceptRow {
  source_id: string;
  unit_id: string;
}

export async function getUnitsByConceptCode(
  schemeId: string,
  code: string,
): Promise<UnitConceptRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<UnitConceptRow>(
    SQL_GET_UNITS_BY_CODE,
    [schemeId, code],
  );
  return r.rows;
}
