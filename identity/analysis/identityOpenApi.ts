//
// OpenAPI routes for identity analysis: root-cause and cluster.
//

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import type { ClusterRequest } from './clusterSchema.ts';
import { ClusterRequestSchema } from './clusterSchema.ts';
import { clusterActorsByOutcome } from './clusterService.ts';
import type { RootCauseRequest } from './rootCauseSchema.ts';
import { RootCauseRequestSchema } from './rootCauseSchema.ts';
import { inferRootCause } from './rootCauseService.ts';

const RootCauseResponseSchema = z
  .object({
    root_cause_codes: z.array(z.string()),
    details: z.array(
      z.object({
        code: z.string(),
        pref_label: z.string().optional(),
      }),
    ),
  })
  .openapi('RootCauseResponse');

const rootCauseRoute = createRoute({
  method: 'post',
  path: '/identity/analysis/root-cause',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RootCauseRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RootCauseResponseSchema,
        },
      },
      description: 'Root-cause analysis result',
    },
    400: { description: 'Invalid request body' },
  },
});

async function rootCauseHandler(
  c: {
    req: { valid: (k: 'json') => RootCauseRequest };
    json: (v: unknown, status?: number) => Response;
  },
) {
  const body = c.req.valid('json');
  const result = await inferRootCause(body);
  return c.json(result);
}

const ClusterResponseSchema = z
  .object({ clusters: z.array(z.array(z.string())) })
  .openapi('ClusterResponse');

const clusterRoute = createRoute({
  method: 'post',
  path: '/identity/actors/cluster',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ClusterRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ClusterResponseSchema,
        },
      },
      description: 'Actor clusters by outcome',
    },
    400: { description: 'Invalid request body' },
  },
});

async function clusterHandler(
  c: {
    req: { valid: (k: 'json') => ClusterRequest };
    json: (v: unknown, status?: number) => Response;
  },
) {
  const body = c.req.valid('json');
  const result = await clusterActorsByOutcome(body);
  return c.json(result);
}

export function registerIdentityAnalysisOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(rootCauseRoute, rootCauseHandler);
  app.openapi(clusterRoute, clusterHandler);
}
