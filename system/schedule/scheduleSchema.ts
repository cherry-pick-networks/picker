/** Schedule item and request schemas (Zod). */
// function-length-ignore-file — schema helpers (store.md §P).

import { z } from 'zod';

/** FSRS state in payload (stub; use real FSRS types when wired). */
export const ScheduleItemPayloadSchema = z.object({
  d: z.number().optional(),
  s: z.number().optional(),
  last_reviewed_at: z.string().optional(),
  last_interval_days: z.number().optional(),
  grade_history: z.array(z.number()).optional(),
});
export type ScheduleItemPayload = z.infer<typeof ScheduleItemPayloadSchema>;

export const ScheduleItemSchema = z.object({
  actor_id: z.string(),
  source_id: z.string(),
  unit_id: z.string(),
  payload: ScheduleItemPayloadSchema,
  next_due_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;

/** Composite id for API: actor_id:source_id:unit_id */
export function scheduleItemId(item: {
  actor_id: string;
  source_id: string;
  unit_id: string;
}): string {
  return `${item.actor_id}:${item.source_id}:${item.unit_id}`;
}

export function parseScheduleItemId(
  id: string,
): { actor_id: string; source_id: string; unit_id: string } | null {
  const parts = id.split(':');
  if (parts.length !== 3) return null;
  return { actor_id: parts[0], source_id: parts[1], unit_id: parts[2] };
}

export const CreateScheduleItemRequestSchema = z.object({
  actor_id: z.string(),
  source_id: z.string(),
  unit_id: z.string(),
});
export type CreateScheduleItemRequest = z.infer<
  typeof CreateScheduleItemRequestSchema
>;

export const ReviewRequestSchema = z.object({
  grade: z.number().int().min(1).max(4),
  reviewed_at: z.string().datetime().optional(),
});
export type ReviewRequest = z.infer<typeof ReviewRequestSchema>;
