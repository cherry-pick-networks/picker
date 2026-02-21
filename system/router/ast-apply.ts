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

function jsonError(status: number, body: string): Response {
  const json = JSON.stringify({ error: body });
  return new Response(json, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function badRequest(): Response {
  const body = JSON.stringify({
    error: "Body must be { path, oldText, newText } (strings); path required",
  });
  return new Response(body, {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

async function parseRequest(
  c: Context,
): Promise<{ path: string; oldText: string; newText: string } | Response> {
  const raw = await c.req.json().catch(() => null);
  const parsed = parseBody(raw);
  if (!parsed || !parsed.path.trim()) return badRequest();
  return { path: parsed.path.trim(), oldText: parsed.oldText, newText: parsed.newText };
}

export async function postAstApply(c: Context): Promise<Response> {
  const parsed = await parseRequest(c);
  if (parsed instanceof Response) return parsed;
  const result = await applyPatch(parsed.path, parsed.oldText, parsed.newText);
  return result.ok ? c.body(null, 200) : jsonError(result.status, result.body);
}
