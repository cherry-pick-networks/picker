/**
 * Identity actors API: actor_id, display_name, level, progress.
 */

import { z } from "zod";

export const ActorSchema = z.object({
  actor_id: z.string(),
  display_name: z.string().optional(),
  level: z.string().optional(),
  progress: z.record(z.string(), z.unknown()).optional().nullable(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const ActorCreateSchema = z.object({
  display_name: z.string().min(1),
  level: z.string().optional(),
  progress: z.record(z.string(), z.unknown()).optional(),
});
export type ActorCreate = z.infer<typeof ActorCreateSchema>;

export const ActorPatchSchema = z.object({
  display_name: z.string().min(1).optional(),
  level: z.string().optional(),
  progress: z.record(z.string(), z.unknown()).optional(),
});
export type ActorPatch = z.infer<typeof ActorPatchSchema>;
