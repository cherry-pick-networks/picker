//
// OpenAPI route and handler for POST /content/diagnose/misconception.
// Registers with OpenAPIHono for doc and validation.
//

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import type { DiagnoseRequest } from './diagnoseSchema.ts';
import {
  DiagnoseRequestSchema,
  DiagnoseResponseSchema,
} from './diagnoseSchema.ts';
import { runMisconceptionDiagnosis } from './diagnoseService.ts';

const diagnoseRoute = createRoute({
  method: 'post',
  path: '/content/diagnose/misconception',
  request: {
    body: {
      content: {
        'application/json': {
          schema: DiagnoseRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DiagnoseResponseSchema,
        },
      },
      description: 'Diagnosis result',
    },
    400: { description: 'Invalid request body' },
  },
});

async function diagnoseHandler(
  c: {
    req: { valid: (key: 'json') => DiagnoseRequest };
    json: (v: unknown, status?: number) => Response;
  },
) {
  const body = c.req.valid('json');
  const result = await runMisconceptionDiagnosis(body);
  if (!result.ok) {
    return c.json(
      { ok: false, message: result.message },
      result.status,
    );
  }
  return c.json(result.response);
}

export function registerDiagnoseOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(diagnoseRoute, diagnoseHandler);
  return;
}
