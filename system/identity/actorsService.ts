/**
 * Identity actors: list, get, create, patch. Composes profile + progress.
 */

import * as profileStore from '#system/actor/profileStore.ts';
import { createProfile, getProfile, updateProfile } from '#system/actor/profileService.ts';
import { getProgress, updateProgress } from '#system/actor/progressService.ts';
import type { Actor, ActorCreate, ActorPatch } from './actorsSchema.ts';

function profileToActor(
  id: string,
  raw: unknown,
  progress: unknown,
): Actor {
  const p = raw != null && typeof raw === 'object' && 'display_name' in raw
    ? (raw as { display_name?: string; level?: string })
    : {};
  const prog = progress != null && typeof progress === 'object'
    ? (progress as Record<string, unknown>)
    : null;
  return {
    actor_id: id,
    display_name: p.display_name,
    level: p.level,
    progress: prog,
  };
}

export async function listActors(name?: string): Promise<Actor[]> {
  const rows = await profileStore.listActorProfiles();
  const out: Actor[] = [];
  for (const row of rows) {
    const progress = await profileStore.getProgress(row.id);
    const actor = profileToActor(row.id, row.payload, progress);
    if (name != null && name !== '') {
      const dn = actor.display_name ?? '';
      if (!dn.toLowerCase().includes(name.toLowerCase())) continue;
    }
    out.push(actor);
  }
  return out;
}

export async function getActor(id: string): Promise<Actor | null> {
  const raw = await profileStore.getProfile(id);
  if (raw == null) return null;
  const progress = await profileStore.getProgress(id);
  return profileToActor(id, raw, progress);
}

export async function createActor(body: ActorCreate): Promise<Actor> {
  const profile = await createProfile({
    display_name: body.display_name,
    level: body.level,
  });
  if (body.progress != null) {
    await updateProgress(profile.id, body.progress);
  }
  const progress = await profileStore.getProgress(profile.id);
  return profileToActor(profile.id, profile, progress);
}

export async function updateActor(
  id: string,
  body: ActorPatch,
): Promise<Actor | null> {
  const raw = await profileStore.getProfile(id);
  if (raw == null) return null;
  if (body.display_name != null || body.level != null) {
    await updateProfile(id, {
      display_name: body.display_name,
      level: body.level,
    });
  }
  if (body.progress != null) {
    await updateProgress(id, body.progress);
  }
  const [profile, progress] = await Promise.all([
    profileStore.getProfile(id),
    profileStore.getProgress(id),
  ]);
  return profile != null ? profileToActor(id, profile, progress) : null;
}
