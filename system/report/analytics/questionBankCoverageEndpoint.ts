import type { Context } from 'hono';
import { buildQuestionBankCoverage } from '#system/report/analytics/questionBankCoverageService.ts';

export function getQuestionBankCoverage(c: Context) {
  const schemeId = c.req.query('scheme_id');
  if (!schemeId) {
    return c.json({ error: 'scheme_id required' }, 400);
  }
  const conceptIds = c.req.query('concept_ids')?.split(',')
    .filter(Boolean);
  return buildQuestionBankCoverage({
    scheme_id: schemeId,
    concept_ids: conceptIds,
  }).then((r) => c.json(r));
}
