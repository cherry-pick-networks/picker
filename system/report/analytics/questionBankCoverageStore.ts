//  Report: item count per concept (question bank coverage).

import { getPg } from '#system/infra/pgClient.ts';
import { loadSql } from '#system/infra/sqlLoader.ts';

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
