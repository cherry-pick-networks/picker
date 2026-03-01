//  OpenAPI route for auto-tag confidence (59).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  AutoTagConfidenceQuerySchema,
  AutoTagConfidenceResponseSchema,
} from './bankAutoTagConfidenceSchema.ts';
import { getAutoTagConfidence } from './bankAutoTagConfidenceService.ts';

const route = createRoute({
  method: 'get',
  path: '/content/items/auto-tag-confidence',
  request: { query: AutoTagConfidenceQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AutoTagConfidenceResponseSchema,
        },
      },
      description: 'Auto-tag confidence',
    },
  },
});

export function registerItemsAutoTagConfidenceOpenApi(
  app: OpenAPIHono,
): void {
  const r = route;
  app.openapi(r, async (c) => {
    return c.json(
      await getAutoTagConfidence(c.req.valid('query')),
    );
  });
}
