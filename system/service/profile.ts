import { z } from "zod";
import * as store from "../store/profile.ts";

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

export async function getProfile(id: string): Promise<Profile | null> {
  const raw = await store.getProfile(id);
  if (raw == null) return null;
  const parsed = ProfileSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function buildProfileRaw(
  body: z.infer<typeof ProfileCreateSchema>,
): Record<string, unknown> {
  const now = new Date().toISOString();
  const id = body.id ?? crypto.randomUUID();
  return {
    id,
    createdAt: body.createdAt ?? now,
    updatedAt: body.updatedAt ?? now,
    grade: body.grade,
    preferences: body.preferences,
    goals: body.goals,
  };
}

function parseProfile(raw: Record<string, unknown>): Profile {
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid profile");
  return parsed.data;
}

export async function createProfile(
  body: z.infer<typeof ProfileCreateSchema>,
): Promise<Profile> {
  const raw = buildProfileRaw(body);
  const profile = parseProfile(raw);
  await store.setProfile(profile.id, profile);
  return profile;
}

function mergeProfile(
  existing: Profile,
  body: z.infer<typeof ProfilePatchSchema>,
  id: string,
): Profile {
  const merged = {
    ...existing,
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  };
  return parseProfile(merged as Record<string, unknown>);
}

async function saveProfileAndReturn(id: string, profile: Profile): Promise<Profile> {
  await store.setProfile(id, profile);
  return profile;
}

export async function updateProfile(
  id: string,
  body: z.infer<typeof ProfilePatchSchema>,
): Promise<Profile | null> {
  const existing = await getProfile(id);
  const profile = existing == null ? null : mergeProfile(existing, body, id);
  if (profile == null) return null;
  return saveProfileAndReturn(id, profile);
}

export async function getProgress(id: string): Promise<Progress | null> {
  const raw = await store.getProgress(id);
  if (raw == null) return null;
  const parsed = ProgressSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseProgress(raw: Record<string, unknown>): Progress {
  const parsed = ProgressSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid progress");
  return parsed.data;
}

function mergeProgress(
  id: string,
  existing: Progress | null,
  body: z.infer<typeof ProgressPatchSchema>,
): Progress {
  const now = new Date().toISOString();
  const base = existing ?? { id, updatedAt: now };
  const merged = { ...base, ...body, id, updatedAt: now };
  return parseProgress(merged as Record<string, unknown>);
}

export async function updateProgress(
  id: string,
  body: z.infer<typeof ProgressPatchSchema>,
): Promise<Progress> {
  const existing = await getProgress(id);
  const progress = mergeProgress(id, existing, body);
  await store.setProgress(id, progress);
  return progress;
}
