import { z } from 'zod';
import { IdentityStores } from '#identity/IdentityStores.ts';
import {
  type Progress,
  ProgressPatchSchema,
  ProgressSchema,
} from '#identity/actors/profileSchema.ts';

export type { Progress };
export { ProgressPatchSchema, ProgressSchema };

export async function getProgress(
  id: string,
): Promise<Progress | null> {
  const raw = await IdentityStores.profileStore.getProgress(
    id,
  );
  if (raw == null) return null;
  const parsed = ProgressSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseProgress(
  raw: Record<string, unknown>,
): Progress {
  const parsed = ProgressSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Invalid progress');
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
  await IdentityStores.profileStore.setProgress(
    id,
    progress,
  );
  return progress;
}
