//  GET /content/assessment/prompt-context: dynamic assessment data for Copilot (Stream B).

import type { Context } from 'hono';
import { buildPromptContext } from './promptContextService.ts';

function parseAssessmentQuery(c: Context): {
  actor_ids: string[];
  from?: string;
  to?: string;
} {
  const actorIdsParam = c.req.query('actor_ids');
  const actor_ids = actorIdsParam
    ? actorIdsParam.split(',').map((s) => s.trim()).filter(
      Boolean,
    )
    : [];
  return {
    actor_ids,
    from: c.req.query('from') ?? undefined,
    to: c.req.query('to') ?? undefined,
  };
}

export async function getAssessmentPromptContext(
  c: Context,
): Promise<Response> {
  const input = parseAssessmentQuery(c);
  const result = await buildPromptContext(input);
  if (!result.ok) {
    return c.json({ error: result.message }, result.status);
  }
  return c.json(result.response);
}
