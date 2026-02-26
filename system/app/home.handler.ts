import type { Context } from "hono";

export function getHome(c: Context) {
  const body = { ok: true };
  return c.json(body);
}
