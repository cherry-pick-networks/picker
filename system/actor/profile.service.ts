import { z } from "zod";
import * as store from "./profile.store.ts";
import {
  type Profile,
  ProfileCreateSchema,
  ProfilePatchSchema,
  ProfileSchema,
} from "./profile.schema.ts";

export type { Profile, Progress } from "./profile.schema.ts";
export {
  ProfileCreateSchema,
  ProfilePatchSchema,
  ProfileSchema,
  ProgressPatchSchema,
  ProgressSchema,
} from "./profile.schema.ts";
export { getProgress, updateProgress } from "./progress.service.ts";

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
    display_name: body.display_name,
    level: body.level,
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

async function saveProfileAndReturn(
  id: string,
  profile: Profile,
): Promise<Profile> {
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
