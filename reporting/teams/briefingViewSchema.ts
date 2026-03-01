//
// Query and response schema for GET /views/team-briefing/:class_id.
//

import { z } from 'zod';
import {
  DailyBriefingResponseSchema,
  FatigueResponseSchema,
  FusionResponseSchema,
  IsolatedStudentsResponseSchema,
  PeerTeacherAdviceResponseSchema,
  ProgressConflictResponseSchema,
  RealTimeInterventionResponseSchema,
  ResourceShortageResponseSchema,
  StudyGroupResponseSchema,
  TARoutingResponseSchema,
} from '#reporting/teams/schema.ts';

export const TeamBriefingViewQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  actor_ids: z.string().optional(),
  scheme_id: z.string().optional(),
  actor_id: z.string().optional(),
  minutes: z.coerce.number().int().min(1).max(1440)
    .optional(),
});
export type TeamBriefingViewQuery = z.infer<
  typeof TeamBriefingViewQuerySchema
>;

export const TeamBriefingViewResponseSchema = z.object({
  daily_briefing: DailyBriefingResponseSchema,
  real_time_intervention:
    RealTimeInterventionResponseSchema,
  ta_routing: TARoutingResponseSchema,
  study_group: StudyGroupResponseSchema,
  fatigue: FatigueResponseSchema,
  fusion: FusionResponseSchema,
  progress_conflict: ProgressConflictResponseSchema,
  isolated_students: IsolatedStudentsResponseSchema,
  resource_shortage: ResourceShortageResponseSchema,
  peer_teacher_advice: PeerTeacherAdviceResponseSchema,
});
export type TeamBriefingViewResponse = z.infer<
  typeof TeamBriefingViewResponseSchema
>;
