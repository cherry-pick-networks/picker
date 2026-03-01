//
// Team briefing view: aggregates 10 Teams APIs into one response.
//

import type {
  TeamBriefingViewQuery,
  TeamBriefingViewResponse,
} from '#reporting/teams/briefingViewSchema.ts';
import {
  getDailyBriefing,
  getFatigue,
  getFusion,
  getIsolatedStudents,
  getPeerTeacherAdvice,
  getProgressConflict,
  getRealTimeIntervention,
  getResourceShortage,
  getStudyGroup,
  getTARouting,
} from '#reporting/teams/service.ts';
import { buildQueries } from './briefingViewServiceHelpers.ts';

export async function getTeamBriefingView(
  classId: string,
  query?: TeamBriefingViewQuery,
): Promise<TeamBriefingViewResponse> {
  const q = buildQueries(classId, query);
  const [
    daily_briefing,
    real_time_intervention,
    ta_routing,
    study_group,
    fatigue,
    fusion,
    progress_conflict,
    isolated_students,
    resource_shortage,
    peer_teacher_advice,
  ] = await Promise.all([
    getDailyBriefing(q.dailyBriefing),
    getRealTimeIntervention(q.realTimeIntervention),
    getTARouting(q.taRouting),
    getStudyGroup(q.studyGroup),
    getFatigue(q.fatigue),
    getFusion(q.fusion),
    getProgressConflict(q.progressConflict),
    getIsolatedStudents(q.isolatedStudents),
    getResourceShortage(q.resourceShortage),
    getPeerTeacherAdvice(q.peerTeacherAdvice),
  ]);
  return {
    daily_briefing,
    real_time_intervention,
    ta_routing,
    study_group,
    fatigue,
    fusion,
    progress_conflict,
    isolated_students,
    resource_shortage,
    peer_teacher_advice,
  };
}
