import type { Item, Worksheet } from "./contentSchema.ts";
import { ItemSchema, WorksheetSchema } from "./contentSchema.ts";

export function nowIso(): string {
  const s = new Date().toISOString();
  return s;
}

export function parseItem(raw: unknown): Item {
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid item");
  return parsed.data;
}

export function parseWorksheet(raw: unknown): Worksheet {
  const parsed = WorksheetSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid worksheet");
  return parsed.data;
}
