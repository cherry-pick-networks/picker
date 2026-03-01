//  Query schemas for report/teams APIs (41–50).

import { z } from '@hono/zod-openapi';

const optionalActorIds = z.string().optional();
const optionalFromTo = z.string().optional();
const optionalSchemeId = z.string().optional();

export const DailyBriefingQuerySchema = z.object({
  actor_ids: optionalActorIds,
  from: optionalFromTo,
  to: optionalFromTo,
});
export type DailyBriefingQuery = z.infer<
  typeof DailyBriefingQuerySchema
>;

export const RealTimeInterventionQuerySchema = z.object({
  actor_id: z.string().optional(),
  minutes: z.coerce.number().int().min(1).max(1440)
    .optional(),
});
export type RealTimeInterventionQuery = z.infer<
  typeof RealTimeInterventionQuerySchema
>;

export const TARoutingQuerySchema = z.object({
  scheme_id: optionalSchemeId,
});
export type TARoutingQuery = z.infer<
  typeof TARoutingQuerySchema
>;

export const StudyGroupQuerySchema = z.object({
  actor_ids: optionalActorIds,
  scheme_id: optionalSchemeId,
});
export type StudyGroupQuery = z.infer<
  typeof StudyGroupQuerySchema
>;

export const FatigueQuerySchema = z.object({
  actor_ids: optionalActorIds,
  from: optionalFromTo,
  to: optionalFromTo,
});
export type FatigueQuery = z.infer<
  typeof FatigueQuerySchema
>;

export const FusionQuerySchema = z.object({
  actor_ids: optionalActorIds,
  scheme_id: optionalSchemeId,
});
export type FusionQuery = z.infer<typeof FusionQuerySchema>;

export const ProgressConflictQuerySchema = z.object({
  actor_ids: optionalActorIds,
  scheme_id: optionalSchemeId,
});
export type ProgressConflictQuery = z.infer<
  typeof ProgressConflictQuerySchema
>;

export const IsolatedStudentsQuerySchema = z.object({
  actor_ids: optionalActorIds,
  scheme_id: optionalSchemeId,
});
export type IsolatedStudentsQuery = z.infer<
  typeof IsolatedStudentsQuerySchema
>;

export const ResourceShortageQuerySchema = z.object({
  scheme_id: optionalSchemeId,
  from: optionalFromTo,
  to: optionalFromTo,
});
export type ResourceShortageQuery = z.infer<
  typeof ResourceShortageQuerySchema
>;

export const PeerTeacherAdviceQuerySchema = z.object({
  actor_id: z.string().optional(),
  scheme_id: optionalSchemeId,
});
export type PeerTeacherAdviceQuery = z.infer<
  typeof PeerTeacherAdviceQuerySchema
>;
