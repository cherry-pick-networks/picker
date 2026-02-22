/**
 * Zod schemas and inferred types for profile and progress.
 */

import { z } from "zod";

/**
 * Profile. preferences may include:
 * - next_session_plan (optional): { question_type?, item_count?,
 *   time_limit_minutes?, structural_notes_override?, constraint_notes? }
 *   — used by buildWorksheetPrompt to merge into the request when
 *   student_id is set.
 * - gimmick, gimmick_notes: used by briefing prompt.
 */
export const ProfileSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  grade: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  goals: z.array(z.string()).optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ProgressSchema = z.object({
  id: z.string(),
  updatedAt: z.string(),
  state: z.string().optional(),
  currentStep: z.string().optional(),
});
export type Progress = z.infer<typeof ProgressSchema>;

export const ProfileCreateSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export const ProfilePatchSchema = ProfileSchema.partial().omit({ id: true });
export const ProgressPatchSchema = ProgressSchema.partial().omit({ id: true });
