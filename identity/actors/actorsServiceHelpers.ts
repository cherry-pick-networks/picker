//  Actor service helpers: profile-to-actor mapping, patch apply, fetch after patch.

import { IdentityStores } from '#identity/IdentityStores.ts';
import { updateProfile } from './profileService.ts';
import { updateProgress } from '#identity/schedule/progressService.ts';
import type { Actor, ActorPatch } from './schema.ts';

export function profileToActor(
  id: string,
  raw: unknown,
  progress: unknown,
): Actor {
  const p = raw != null && typeof raw === 'object' &&
      'display_name' in raw
    ? (raw as { display_name?: string; level?: string })
    : {};
  const prog =
    progress != null && typeof progress === 'object'
      ? (progress as Record<string, unknown>)
      : null;
  return {
    actor_id: id,
    display_name: p.display_name,
    level: p.level,
    progress: prog,
  };
}

export async function applyActorPatch(
  id: string,
  body: ActorPatch,
): Promise<void> {
  if (body.display_name != null || body.level != null) {
    await updateProfile(id, {
      display_name: body.display_name,
      level: body.level,
    });
  }
  if (body.progress != null) {
    await updateProgress(id, body.progress);
  }
}

export async function fetchActorAfterPatch(
  id: string,
): Promise<Actor | null> {
  const [profile, progress] = await Promise.all([
    IdentityStores.profileStore.getProfile(id),
    IdentityStores.profileStore.getProgress(id),
  ]);
  return profile != null
    ? profileToActor(id, profile, progress)
    : null;
}
