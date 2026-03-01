//  OpenAPI route for POST /report/query (batched report metrics).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  ReportQueryBodySchema,
  ReportQueryResponseSchema,
} from '#system/report/query/reportSchema.ts';
import { runReportQuery } from '#system/report/query/reportService.ts';

const reportQueryRoute = createRoute({
  method: 'post',
  path: '/report/query',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ReportQueryBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ReportQueryResponseSchema,
        },
      },
      description: 'Metrics keyed by name',
    },
    400: {
      description: 'Invalid body (e.g. empty metrics)',
    },
  },
});

export function registerReportQueryOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(reportQueryRoute, async (c) => {
    const body = c.req.valid('json');
    const result = await runReportQuery(body);
    return c.json(result);
  });
  return;
}
