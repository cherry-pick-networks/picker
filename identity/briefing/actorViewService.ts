//
// Actor briefing view: aggregates 10 Outlook services into one response.
// Returns null when actor does not exist.
//

import type { ActorBriefingView } from './actorViewSchema.ts';
import { getActor } from '#identity/actors/service.ts';
import { getCustomGoalTracking } from '../outlook/customGoalTrackingService.ts';
import { getInterventionResult } from '../outlook/interventionResultService.ts';
import { getMilestoneAchievement } from '../outlook/milestoneAchievementService.ts';
import { getMissingHomeworkImpact } from '../outlook/missingHomeworkImpactService.ts';
import { getMotivationDropAlert } from '../outlook/motivationDropAlertService.ts';
import { getNextMonthPreview } from '../outlook/nextMonthPreviewService.ts';
import { getParentFaqContext } from '../outlook/parentFaqContextService.ts';
import { getPositiveReinforcement } from '../outlook/positiveReinforcementService.ts';
import { getRelativePosition } from '../outlook/relativePositionService.ts';
import { getWeeklyWin } from '../outlook/weeklyWinService.ts';

export async function getActorBriefingView(
  actorId: string,
  from?: string,
  to?: string,
): Promise<ActorBriefingView | null> {
  const actor = await getActor(actorId);
  if (actor == null) return null;

  const [
    positive_reinforcement,
    missing_homework_impact,
    milestone_achievement,
    parent_faq_context,
    motivation_drop_alert,
    weekly_win,
    intervention_result,
    next_month_preview,
    relative_position,
    custom_goal_tracking,
  ] = await Promise.all([
    getPositiveReinforcement({
      actor_id: actorId,
      from,
      to,
    }),
    getMissingHomeworkImpact({
      actor_id: actorId,
      from,
      to,
    }),
    getMilestoneAchievement({
      actor_id: actorId,
      from,
      to,
    }),
    getParentFaqContext({ actor_id: actorId }),
    getMotivationDropAlert({ actor_id: actorId, from, to }),
    getWeeklyWin({
      actor_id: actorId,
      week_start: from,
    }),
    getInterventionResult({ actor_id: actorId, from, to }),
    getNextMonthPreview({ actor_id: actorId, as_of: from }),
    getRelativePosition({
      actor_id: actorId,
      scheme_id: '',
      from,
      to,
    }),
    getCustomGoalTracking({ actor_id: actorId }),
  ]);

  return {
    positive_reinforcement,
    missing_homework_impact,
    milestone_achievement,
    parent_faq_context,
    motivation_drop_alert,
    weekly_win,
    intervention_result,
    next_month_preview,
    relative_position,
    custom_goal_tracking,
  };
}
