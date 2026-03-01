//  OpenAPI route for concept drift (57).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  ConceptDriftQuerySchema,
  ConceptDriftResponseSchema,
} from '#reporting/config/ontology/conceptDriftSchema.ts';
import { getConceptDrift } from '#reporting/config/ontology/conceptDriftService.ts';

const route = createRoute({
  method: 'get',
  path: '/report/ontology/concept-drift',
  request: { query: ConceptDriftQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ConceptDriftResponseSchema,
        },
      },
      description: 'Concept drift',
    },
  },
});

export function registerReportOntologyConceptDriftOpenApi(
  app: OpenAPIHono,
): void {
  const r = route;
  app.openapi(r, async (c) => {
    const q = c.req.valid('query');
    return c.json(await getConceptDrift(q));
  });
}
