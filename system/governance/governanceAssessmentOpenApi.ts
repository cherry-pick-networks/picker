//  OpenAPI route for mastery threshold validation (60).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  MasteryThresholdValidationQuerySchema,
  MasteryThresholdValidationResponseSchema,
} from '#system/governance/assessmentValidationSchema.ts';
import { getMasteryThresholdValidation } from '#system/governance/assessmentValidationService.ts';

const route = createRoute({
  method: 'get',
  path:
    '/governance/assessment/mastery-threshold-validation',
  request: { query: MasteryThresholdValidationQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MasteryThresholdValidationResponseSchema,
        },
      },
      description: 'Mastery threshold validation',
    },
  },
});

export function registerGovernanceAssessmentOpenApi(
  app: OpenAPIHono,
): void {
  const r = route;
  app.openapi(r, async (c) => {
    const q = c.req.valid('query');
    const out = await getMasteryThresholdValidation(q);
    return c.json(out);
  });
}
