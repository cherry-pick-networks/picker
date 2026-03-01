//  OpenAPI routes for missing-link predictor (56) and ontology versioning (58).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  MissingLinkPredictorQuerySchema,
  MissingLinkPredictorResponseSchema,
  OntologyVersioningQuerySchema,
  OntologyVersioningResponseSchema,
} from '#system/governance/ontologySuggestSchema.ts';
import {
  getMissingLinkPredictor,
  getOntologyVersioning,
} from '#system/governance/ontologySuggestService.ts';

const missingLinkRoute = createRoute({
  method: 'get',
  path: '/governance/ontology/missing-link-predictor',
  request: { query: MissingLinkPredictorQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MissingLinkPredictorResponseSchema,
        },
      },
      description: 'Missing link / edge suggestions',
    },
  },
});

const versioningRoute = createRoute({
  method: 'get',
  path: '/governance/ontology/versioning',
  request: { query: OntologyVersioningQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: OntologyVersioningResponseSchema,
        },
      },
      description:
        'Ontology versioning (stub/empty when no mapping table)',
    },
  },
});

export function registerGovernanceOntologyOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(missingLinkRoute, async (c) => {
    const q = c.req.valid('query');
    return c.json(await getMissingLinkPredictor(q));
  });
  app.openapi(versioningRoute, async (c) => {
    const q = c.req.valid('query');
    return c.json(await getOntologyVersioning(q));
  });
}
