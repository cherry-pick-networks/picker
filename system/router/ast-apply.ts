import type { Context } from "hono";
import { applyPatch } from "../service/ast.ts";

function parseBody(body: unknown): {
  path: string;
  oldText: string;
  newText: string;
} | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const o = body as Record<string, unknown>;
  if (
    typeof o.path !== "string" ||
    typeof o.oldText !== "string" ||
    typeof o.newText !== "string"
  ) {
    return null;
  }
  return { path: o.path, oldText: o.oldText, newText: o.newText };
}

export async function postAstApply(c: Context): Promise<Response> {
  const raw = await c.req.json().catch(() => null);
  const parsed = parseBody(raw);
  if (!parsed) {
    return c.json(
      { error: "Body must be { path, oldText, newText } (strings)" },
      400,
    );
  }
  const { path, oldText, newText } = parsed;
  const pathTrim = path.trim();
  if (!pathTrim) {
    return c.json({ error: "path required" }, 400);
  }
  const result = await applyPatch(pathTrim, oldText, newText);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.body }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.body(null, 200);
}
