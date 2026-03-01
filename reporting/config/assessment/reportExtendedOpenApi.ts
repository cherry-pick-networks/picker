//  OpenAPI routes for partial-score (54) and formative-summative-gap (55).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  FormativeSummativeGapQuerySchema,
  FormativeSummativeGapResponseSchema,
  PartialScoreQuerySchema,
  PartialScoreResponseSchema,
} from '#reporting/config/assessment/extendedSchema.ts';
import {
  getFormativeSummativeGap,
  getPartialScore,
} from '#reporting/config/assessment/extendedService.ts';

const partialScoreRoute = createRoute({
  method: 'get',
  path: '/report/assessment/partial-score',
  request: { query: PartialScoreQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PartialScoreResponseSchema,
        },
      },
      description: 'Partial scores',
    },
  },
});

const formativeSummativeRoute = createRoute({
  method: 'get',
  path: '/report/assessment/formative-summative-gap',
  request: { query: FormativeSummativeGapQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FormativeSummativeGapResponseSchema,
        },
      },
      description: 'Formative vs summative gap',
    },
  },
});

export function registerReportAssessmentExtendedOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(partialScoreRoute, async (c) => {
    const q = c.req.valid('query');
    return c.json(await getPartialScore(q));
  });
  app.openapi(formativeSummativeRoute, async (c) => {
    const q = c.req.valid('query');
    return c.json(await getFormativeSummativeGap(q));
  });
}
