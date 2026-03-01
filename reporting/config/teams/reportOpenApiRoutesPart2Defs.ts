//  Report/teams OpenAPI route definitions part 2. Used by reportOpenApiRoutesPart2.

import { createRoute } from '@hono/zod-openapi';
import {
  FusionQuerySchema,
  FusionResponseSchema,
  IsolatedStudentsQuerySchema,
  IsolatedStudentsResponseSchema,
  PeerTeacherAdviceQuerySchema,
  PeerTeacherAdviceResponseSchema,
  ProgressConflictQuerySchema,
  ProgressConflictResponseSchema,
  ResourceShortageQuerySchema,
  ResourceShortageResponseSchema,
} from '#reporting/config/teams/schema.ts';

export const fusionRoute = createRoute({
  method: 'get',
  path: '/report/teams/fusion',
  request: { query: FusionQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FusionResponseSchema,
        },
      },
      description: 'Fusion/cross-concept signals',
    },
  },
});
export const progressConflictRoute = createRoute({
  method: 'get',
  path: '/report/teams/progress-conflict',
  request: { query: ProgressConflictQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProgressConflictResponseSchema,
        },
      },
      description: 'Progress conflict',
    },
  },
});
export const isolatedStudentsRoute = createRoute({
  method: 'get',
  path: '/report/teams/isolated-students',
  request: { query: IsolatedStudentsQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: IsolatedStudentsResponseSchema,
        },
      },
      description: 'Isolated students',
    },
  },
});
export const resourceShortageRoute = createRoute({
  method: 'get',
  path: '/report/teams/resource-shortage',
  request: { query: ResourceShortageQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResourceShortageResponseSchema,
        },
      },
      description: 'Resource shortage',
    },
  },
});
export const peerTeacherAdviceRoute = createRoute({
  method: 'get',
  path: '/report/teams/peer-teacher-advice',
  request: { query: PeerTeacherAdviceQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PeerTeacherAdviceResponseSchema,
        },
      },
      description:
        'Peer teacher advice (stub when no instructor-node data)',
    },
  },
});
