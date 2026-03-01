//  Response schemas for report/teams APIs (41–50).

import { z } from '@hono/zod-openapi';

export const DailyBriefingResponseSchema = z
  .object({ briefing: z.record(z.string(), z.unknown()) })
  .openapi('TeamsDailyBriefingResponse');
export const RealTimeInterventionResponseSchema = z
  .object({
    log: z.array(
      z.object({
        id: z.string(),
        actor_id: z.string(),
        item_id: z.string(),
        recorded_at: z.string(),
      }),
    ),
  })
  .openapi('TeamsRealTimeInterventionResponse');
export const TARoutingResponseSchema = z
  .object({
    stub: z.literal(true).optional(),
    assignments: z.array(z.record(z.string(), z.unknown()))
      .optional(),
  })
  .openapi('TeamsTARoutingResponse');
export const StudyGroupResponseSchema = z
  .object({ groups: z.array(z.array(z.string())) })
  .openapi('TeamsStudyGroupResponse');
export const FatigueResponseSchema = z
  .object({
    signals: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('TeamsFatigueResponse');
export const FusionResponseSchema = z
  .object({
    signals: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('TeamsFusionResponse');
export const ProgressConflictResponseSchema = z
  .object({
    conflicts: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('TeamsProgressConflictResponse');
export const IsolatedStudentsResponseSchema = z
  .object({ actors: z.array(z.string()) })
  .openapi('TeamsIsolatedStudentsResponse');
export const ResourceShortageResponseSchema = z
  .object({
    shortages: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('TeamsResourceShortageResponse');
export const PeerTeacherAdviceResponseSchema = z
  .object({
    stub: z.literal(true).optional(),
    advice: z.array(z.record(z.string(), z.unknown()))
      .optional(),
  })
  .openapi('TeamsPeerTeacherAdviceResponse');
