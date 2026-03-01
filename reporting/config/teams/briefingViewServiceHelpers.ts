//  Team briefing view: build per-API query args. Used by briefingViewService.

import type { TeamBriefingViewQuery } from '#reporting/config/teams/briefingViewSchema.ts';

export function buildQueries(
  classId: string,
  q?: TeamBriefingViewQuery,
) {
  const opts = {
    from: q?.from,
    to: q?.to,
    actor_ids: q?.actor_ids,
    scheme_id: q?.scheme_id ?? classId,
    actor_id: q?.actor_id,
    minutes: q?.minutes,
  };
  return {
    dailyBriefing: {
      actor_ids: opts.actor_ids,
      from: opts.from,
      to: opts.to,
    },
    realTimeIntervention: {
      actor_id: opts.actor_id,
      minutes: opts.minutes,
    },
    taRouting: { scheme_id: opts.scheme_id },
    studyGroup: {
      actor_ids: opts.actor_ids,
      scheme_id: opts.scheme_id,
    },
    fatigue: {
      actor_ids: opts.actor_ids,
      from: opts.from,
      to: opts.to,
    },
    fusion: {
      actor_ids: opts.actor_ids,
      scheme_id: opts.scheme_id,
    },
    progressConflict: {
      actor_ids: opts.actor_ids,
      scheme_id: opts.scheme_id,
    },
    isolatedStudents: {
      actor_ids: opts.actor_ids,
      scheme_id: opts.scheme_id,
    },
    resourceShortage: {
      scheme_id: opts.scheme_id,
      from: opts.from,
      to: opts.to,
    },
    peerTeacherAdvice: {
      actor_id: opts.actor_id,
      scheme_id: opts.scheme_id,
    },
  };
}
