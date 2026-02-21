import type { Context } from "hono";

// deno-lint-ignore function-length/function-length
export function getHome(c: Context) {
  return c.json({ ok: true });
}
