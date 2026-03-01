import type { Item } from '#api/search/configurations/bankSchema.ts';
import { ItemSchema } from '#api/search/configurations/bankSchema.ts';

export function nowIso(): string {
  const s = new Date().toISOString();
  return s;
}

export function parseItem(raw: unknown): Item {
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Invalid item');
  return parsed.data;
}
