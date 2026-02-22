import { getKv } from "../../kv/store/kv.ts";

export async function getProfile(id: string): Promise<unknown | null> {
  const kv = await getKv();
  const e = await kv.get(["profile", id]);
  return e.value ?? null;
}

export async function setProfile(id: string, value: unknown): Promise<void> {
  const kv = await getKv();
  await kv.set(["profile", id], value);
}

export async function getProgress(id: string): Promise<unknown | null> {
  const kv = await getKv();
  const e = await kv.get(["progress", id]);
  return e.value ?? null;
}

export async function setProgress(id: string, value: unknown): Promise<void> {
  const kv = await getKv();
  await kv.set(["progress", id], value);
}
