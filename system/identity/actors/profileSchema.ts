//
// Zod schemas and inferred types for profile and progress.
//

import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string(),
  display_name: z.string().optional(),
  level: z.string().optional(),
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
export const ProfilePatchSchema = ProfileSchema.partial()
  .omit({ id: true });
export const ProgressPatchSchema = ProgressSchema.partial()
  .omit({ id: true });
