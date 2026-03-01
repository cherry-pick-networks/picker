//  Report: item count per concept (question bank coverage).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL = await loadSql(
  sqlDir,
  'question_bank_coverage.sql',
);

export interface QuestionBankCoverageRow {
  concept_id: string;
  item_count: number;
}

export async function getQuestionBankCoverage(
  schemeId: string,
): Promise<QuestionBankCoverageRow[]> {
  const pg = await getPg();
  const r = await pg.queryObject<QuestionBankCoverageRow>(
    SQL,
    [
      schemeId,
    ],
  );
  return r.rows;
}
