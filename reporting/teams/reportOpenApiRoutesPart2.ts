//  Report/teams OpenAPI routes part 2 (fusion … peer-teacher-advice).

import { createRoute } from '@hono/zod-openapi';
import {
  getFusion,
  getIsolatedStudents,
  getPeerTeacherAdvice,
  getProgressConflict,
  getResourceShortage,
} from '#reporting/teams/service.ts';
import {
  fusionRoute,
  isolatedStudentsRoute,
  peerTeacherAdviceRoute,
  progressConflictRoute,
  resourceShortageRoute,
} from './reportOpenApiRoutesPart2Defs.ts';

type ReportHandler = (q: unknown) => Promise<unknown>;

export const reportRouteHandlersPart2: Array<{
  route: ReturnType<typeof createRoute>;
  get: ReportHandler;
}> = [
  { route: fusionRoute, get: getFusion as ReportHandler },
  {
    route: progressConflictRoute,
    get: getProgressConflict as ReportHandler,
  },
  {
    route: isolatedStudentsRoute,
    get: getIsolatedStudents as ReportHandler,
  },
  {
    route: resourceShortageRoute,
    get: getResourceShortage as ReportHandler,
  },
  {
    route: peerTeacherAdviceRoute,
    get: getPeerTeacherAdvice as ReportHandler,
  },
];
