import type { Context } from 'hono';
import {
  getRubricEvaluationData as buildRubricEvaluationData,
} from './rubricEvaluationDataService.ts';

export async function getRubricEvaluationData(c: Context) {
  const result = await buildRubricEvaluationData({
    concept_id: c.req.query('concept_id') ?? undefined,
    type: c.req.query('type') ?? undefined,
  });
  return c.json(result);
}
