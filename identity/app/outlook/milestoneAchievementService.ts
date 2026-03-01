export interface OutlookMilestoneAchievementInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export function getMilestoneAchievement(
  _input: OutlookMilestoneAchievementInput,
) {
  const out = { milestones: [] };
  return out;
}
