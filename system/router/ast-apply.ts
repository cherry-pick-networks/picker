import type { Context } from "hono";
import { applyPatch } from "../service/ast.ts";

const isPathOldNewObject = (o: Record<string, unknown>): o is { path: string; oldText: string; newText: string } =>
  typeof o.path === "string" && typeof o.oldText === "string" && typeof o.newText === "string";

function invalidAstBody(body: unknown, o: Record<string, unknown>): boolean {
  return body === null || typeof body !== "object" || Array.isArray(body) || !isPathOldNewObject(o);
}

function parseBody(body: unknown): {
  path: string;
  oldText: string;
  newText: string;
} | null {
  const o = body as Record<string, unknown>;
  if (invalidAstBody(body, o)) return null;
  return { path: o.path, oldText: o.oldText, newText: o.newText };
}

function jsonError(status: number, body: string): Response {
  const json = JSON.stringify({ error: body });
  return new Response(json, { status, headers: { "Content-Type": "application/json" } });
}

const BAD_REQUEST_MSG =
  "Body must be { path, oldText, newText } (strings); path required";

function badRequest(): Response {
  const body = JSON.stringify({ error: BAD_REQUEST_MSG });
  return new Response(body, { status: 400, headers: { "Content-Type": "application/json" } });
}

function parseRequestSync(
  raw: unknown,
  _c: Context,
): { path: string; oldText: string; newText: string } | Response {
  const parsed = parseBody(raw);
  if (!parsed || !parsed.path.trim()) return badRequest();
  return { path: parsed.path.trim(), oldText: parsed.oldText, newText: parsed.newText };
}

async function parseRequest(
  c: Context,
): Promise<{ path: string; oldText: string; newText: string } | Response> {
  const raw = await c.req.json().catch(() => null);
  return parseRequestSync(raw, c);
}

export async function postAstApply(c: Context): Promise<Response> {
  const parsed = await parseRequest(c);
  if (parsed instanceof Response) return parsed;
  const result = await applyPatch(parsed.path, parsed.oldText, parsed.newText);
  return result.ok ? c.body(null, 200) : jsonError(result.status, result.body);
}
