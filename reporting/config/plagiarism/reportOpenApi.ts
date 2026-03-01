//  OpenAPI route for plagiarism anomaly (53).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  PlagiarismQuerySchema,
  PlagiarismResponseSchema,
} from '#reporting/config/plagiarism/schema.ts';
import { getPlagiarismAnomaly } from '#reporting/config/plagiarism/service.ts';

const route = createRoute({
  method: 'get',
  path: '/report/anomaly/plagiarism',
  request: { query: PlagiarismQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PlagiarismResponseSchema,
        },
      },
      description: 'Plagiarism anomalies',
    },
  },
});

export function registerReportPlagiarismOpenApi(
  app: OpenAPIHono,
): void {
  const r = route;
  app.openapi(r, async (c) => {
    return c.json(
      await getPlagiarismAnomaly(c.req.valid('query')),
    );
  });
}
