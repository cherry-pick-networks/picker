//  OpenAPI: POST /content/engines/assessment/generate (unified engine).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  AssessmentEngineRequestSchema,
  AssessmentEngineResponseSchema,
} from './assessmentEngineSchema.ts';
import { runAssessmentEngine } from './assessmentEngineService.ts';

const route = createRoute({
  method: 'post',
  path: '/content/engines/assessment/generate',
  request: {
    body: {
      content: {
        'application/json': {
          schema: AssessmentEngineRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AssessmentEngineResponseSchema,
        },
      },
      description:
        'Wrong-answer options, next item, or diagnosis',
    },
    400: { description: 'Invalid request or context' },
    404: { description: 'Not found (e.g. actor)' },
    502: { description: 'Engine error' },
  },
});

async function handler(
  c: {
    req: {
      valid: (
        key: 'json',
      ) => Parameters<typeof runAssessmentEngine>[0];
    };
    json: (v: unknown, status?: number) => Response;
  },
) {
  const body = c.req.valid('json');
  const result = await runAssessmentEngine(body);
  if ('ok' in result && result.ok === false) {
    return c.json(
      { message: result.message },
      result.status,
    );
  }
  return c.json(result);
}

export function registerAssessmentEngineOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(route, handler);
  return;
}
