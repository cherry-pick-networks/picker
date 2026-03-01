//
// Identity actors: list, get, create, patch. Composes profile + progress.
//

import { IdentityStores } from '#identity/IdentityStores.ts';
import { createProfile } from './profileService.ts';
import { updateProgress } from '#identity/schedule/progressService.ts';
import type {
  Actor,
  ActorCreate,
  ActorPatch,
} from './schema.ts';
import {
  applyActorPatch,
  fetchActorAfterPatch,
  profileToActor,
} from './actorsServiceHelpers.ts';

export async function listActors(
  name?: string,
): Promise<Actor[]> {
  const rows = await IdentityStores.profileStore
    .listActorProfiles();
  const out: Actor[] = [];
  for (const row of rows) {
    const progress = await IdentityStores.profileStore
      .getProgress(row.id);
    const actor = profileToActor(
      row.id,
      row.payload,
      progress,
    );
    if (name != null && name !== '') {
      const dn = actor.display_name ?? '';
      if (!dn.toLowerCase().includes(name.toLowerCase())) {
        continue;
      }
    }
    out.push(actor);
  }
  return out;
}

export async function getActor(
  id: string,
): Promise<Actor | null> {
  const raw = await IdentityStores.profileStore.getProfile(
    id,
  );
  if (raw == null) return null;
  const progress = await IdentityStores.profileStore
    .getProgress(id);
  return profileToActor(id, raw, progress);
}

export async function createActor(
  body: ActorCreate,
): Promise<Actor> {
  const profile = await createProfile({
    display_name: body.display_name,
    level: body.level,
  });
  if (body.progress != null) {
    await updateProgress(profile.id, body.progress);
  }
  const progress = await IdentityStores.profileStore
    .getProgress(profile.id);
  return profileToActor(profile.id, profile, progress);
}

export async function updateActor(
  id: string,
  body: ActorPatch,
): Promise<Actor | null> {
  const raw = await IdentityStores.profileStore.getProfile(
    id,
  );
  if (raw == null) return null;
  await applyActorPatch(id, body);
  return fetchActorAfterPatch(id);
}
