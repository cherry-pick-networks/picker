import type { Item } from './bankSchema.ts';
import { ItemSchema } from './bankSchema.ts';

export function nowIso(): string {
  const s = new Date().toISOString();
  return s;
}

export function parseItem(raw: unknown): Item {
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Invalid item');
  return parsed.data;
}
