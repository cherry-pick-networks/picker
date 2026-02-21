import type { Context } from "hono";
import { listScripts, readScript, writeScript } from "../store/scripts.ts";

export async function getScriptsList(c: Context) {
  const result = await listScripts();
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.body }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.json({ entries: result.entries });
}

function scriptPathFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  return pathname.replace(/^\/scripts\/?/, "") ?? "";
}

export async function getScriptPath(c: Context) {
  const path = scriptPathFromUrl(c.req.url);
  const result = await readScript(path);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.body }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(result.content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function postScriptPath(c: Context) {
  const path = scriptPathFromUrl(c.req.url);
  if (!path.trim()) return c.json({ error: "path required" }, 400);
  return postScriptPathResponse(c, path);
}

async function postScriptPathResponse(
  c: Context,
  path: string,
): Promise<Response> {
  const content = await c.req.text();
  const result = await writeScript(path, content);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.body }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.body(null, 201);
}
