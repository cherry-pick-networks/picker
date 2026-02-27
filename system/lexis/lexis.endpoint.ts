/** Lexis HTTP endpoints. */

import type { Context } from "hono";
import { listEntriesBySourceAndDays } from "./lexis.store.ts";

function validateQuery(
  sourceId: string,
  days: number[],
): { error: string } | null {
  if (!sourceId.trim()) return { error: "Query source_id required" };
  if (days.length === 0) {
    return { error: "Query days required (comma-separated)" };
  }
  return null;
}

// function-length-ignore — endpoint: query read, validate, fetch, respond
export async function getEntries(c: Context) {
  const sourceId = c.req.query("source_id") ?? "";
  const days = parseDaysQuery(c.req.query("days") ?? "");
  const err = validateQuery(sourceId, days);
  if (err) return c.json(err, 400);
  const entries = await listEntriesBySourceAndDays(sourceId.trim(), days);
  return c.json({ entries });
}

function parseDaysQuery(s: string): number[] {
  const raw = s.split(",").map((x) => parseInt(x.trim(), 10));
  const out = raw.filter((n) => Number.isInteger(n) && n >= 1);
  return [...new Set(out)].sort((a, b) => a - b);
}
