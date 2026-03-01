//  Report/teams OpenAPI routes part 1 (daily-briefing … fatigue).

import { createRoute } from '@hono/zod-openapi';
import {
  getDailyBriefing,
  getFatigue,
  getRealTimeIntervention,
  getStudyGroup,
  getTARouting,
} from '#reporting/config/teams/service.ts';
import {
  dailyBriefingRoute,
  fatigueRoute,
  realTimeInterventionRoute,
  studyGroupRoute,
  taRoutingRoute,
} from './reportOpenApiRoutesPart1Defs.ts';

type ReportHandler = (q: unknown) => Promise<unknown>;

export const reportRouteHandlersPart1: Array<{
  route: ReturnType<typeof createRoute>;
  get: ReportHandler;
}> = [
  {
    route: dailyBriefingRoute,
    get: getDailyBriefing as ReportHandler,
  },
  {
    route: realTimeInterventionRoute,
    get: getRealTimeIntervention as ReportHandler,
  },
  {
    route: taRoutingRoute,
    get: getTARouting as ReportHandler,
  },
  {
    route: studyGroupRoute,
    get: getStudyGroup as ReportHandler,
  },
  { route: fatigueRoute, get: getFatigue as ReportHandler },
];
