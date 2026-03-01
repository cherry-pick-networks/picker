//  Report/teams OpenAPI route definitions part 1. Used by reportOpenApiRoutesPart1.

import { createRoute } from '@hono/zod-openapi';
import {
  DailyBriefingQuerySchema,
  DailyBriefingResponseSchema,
  FatigueQuerySchema,
  FatigueResponseSchema,
  RealTimeInterventionQuerySchema,
  RealTimeInterventionResponseSchema,
  StudyGroupQuerySchema,
  StudyGroupResponseSchema,
  TARoutingQuerySchema,
  TARoutingResponseSchema,
} from '#reporting/teams/schema.ts';

export const dailyBriefingRoute = createRoute({
  method: 'get',
  path: '/report/teams/daily-briefing',
  request: { query: DailyBriefingQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: DailyBriefingResponseSchema,
        },
      },
      description: 'Daily briefing',
    },
  },
});
export const realTimeInterventionRoute = createRoute({
  method: 'get',
  path: '/report/teams/real-time-intervention',
  request: { query: RealTimeInterventionQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RealTimeInterventionResponseSchema,
        },
      },
      description: 'Recent N minutes review log',
    },
  },
});
export const taRoutingRoute = createRoute({
  method: 'get',
  path: '/report/teams/ta-routing',
  request: { query: TARoutingQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TARoutingResponseSchema,
        },
      },
      description:
        'TA routing (stub when no instructor-node data)',
    },
  },
});
export const studyGroupRoute = createRoute({
  method: 'get',
  path: '/report/teams/study-group',
  request: { query: StudyGroupQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: StudyGroupResponseSchema,
        },
      },
      description: 'Study group suggestions',
    },
  },
});
export const fatigueRoute = createRoute({
  method: 'get',
  path: '/report/teams/fatigue',
  request: { query: FatigueQuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: FatigueResponseSchema,
        },
      },
      description: 'Fatigue signals',
    },
  },
});
