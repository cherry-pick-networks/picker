import type { Context } from 'hono';
import {
  getTestItemDiscrimination as buildTestItemDiscrimination,
} from '#analytics/search/testItemDiscriminationService.ts';

export function getTestItemDiscrimination(
  c: Context,
) {
  const schemeId = c.req.query('scheme_id');
  if (!schemeId) {
    return c.json({ error: 'scheme_id required' }, 400);
  }
  const minResp = c.req.query('min_responses');
  return buildTestItemDiscrimination({
    scheme_id: schemeId,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
    min_responses: minResp
      ? parseInt(minResp, 10)
      : undefined,
  }).then((r) => c.json(r));
}
