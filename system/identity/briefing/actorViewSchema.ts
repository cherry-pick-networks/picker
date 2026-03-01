//  Query and response schema for GET /views/actor-briefing/:id.

import { z } from 'zod';

export const ActorBriefingViewQuerySchema = z.object({
  id: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type ActorBriefingViewQuery = z.infer<
  typeof ActorBriefingViewQuerySchema
>;

const positiveReinforcementSchema = z.object({
  suggestions: z.array(z.unknown()),
});
const missingHomeworkImpactSchema = z.object({
  impact_summary: z.unknown().nullable(),
});
const milestoneAchievementSchema = z.object({
  milestones: z.array(z.unknown()),
});
const parentFaqContextSchema = z.object({
  context: z.array(z.unknown()),
  stub: z.boolean(),
  message: z.string(),
});
const motivationDropAlertSchema = z.object({
  alerts: z.array(z.unknown()),
});
const weeklyWinSchema = z.object({
  wins: z.array(z.unknown()),
});
const interventionResultSchema = z.object({
  results: z.array(z.unknown()),
});
const nextMonthPreviewSchema = z.object({
  preview: z.record(z.string(), z.unknown()),
});
const relativePositionSchema = z.object({
  position: z.unknown().nullable(),
});
const customGoalTrackingSchema = z.object({
  goals: z.array(z.unknown()),
  progress: z.record(z.string(), z.unknown()),
});

export const ActorBriefingViewSchema = z.object({
  positive_reinforcement: positiveReinforcementSchema,
  missing_homework_impact: missingHomeworkImpactSchema,
  milestone_achievement: milestoneAchievementSchema,
  parent_faq_context: parentFaqContextSchema,
  motivation_drop_alert: motivationDropAlertSchema,
  weekly_win: weeklyWinSchema,
  intervention_result: interventionResultSchema,
  next_month_preview: nextMonthPreviewSchema,
  relative_position: relativePositionSchema,
  custom_goal_tracking: customGoalTrackingSchema,
});
export type ActorBriefingView = z.infer<
  typeof ActorBriefingViewSchema
>;
