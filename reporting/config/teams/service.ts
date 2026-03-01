//  Report teams services: daily briefing, TA/study/fatigue/etc.
import type {
  DailyBriefingQuery,
  FatigueQuery,
  FusionQuery,
  IsolatedStudentsQuery,
  PeerTeacherAdviceQuery,
  ProgressConflictQuery,
  ResourceShortageQuery,
  StudyGroupQuery,
  TARoutingQuery,
} from '#reporting/config/teams/schema.ts';

export { getRealTimeIntervention } from './serviceRealTime.ts';

export async function getDailyBriefing(
  _q: DailyBriefingQuery,
): Promise<{ briefing: Record<string, unknown> }> {
  await Promise.resolve();
  return { briefing: {} };
}

export async function getTARouting(
  _q: TARoutingQuery,
): Promise<
  { stub?: true; assignments?: Record<string, unknown>[] }
> {
  await Promise.resolve();
  return { stub: true };
}

export async function getStudyGroup(
  _q: StudyGroupQuery,
): Promise<{ groups: string[][] }> {
  await Promise.resolve();
  return { groups: [] };
}

export async function getFatigue(
  _q: FatigueQuery,
): Promise<{ signals: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { signals: [] };
}

export async function getFusion(
  _q: FusionQuery,
): Promise<{ signals: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { signals: [] };
}

export async function getProgressConflict(
  _q: ProgressConflictQuery,
): Promise<{ conflicts: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { conflicts: [] };
}

export async function getIsolatedStudents(
  _q: IsolatedStudentsQuery,
): Promise<{ actors: string[] }> {
  await Promise.resolve();
  return { actors: [] };
}

export async function getResourceShortage(
  _q: ResourceShortageQuery,
): Promise<{ shortages: Record<string, unknown>[] }> {
  await Promise.resolve();
  return { shortages: [] };
}

export async function getPeerTeacherAdvice(
  _q: PeerTeacherAdviceQuery,
): Promise<
  { stub?: true; advice?: Record<string, unknown>[] }
> {
  await Promise.resolve();
  return { stub: true };
}
