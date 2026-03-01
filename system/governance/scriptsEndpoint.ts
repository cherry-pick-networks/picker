import type { Context } from 'hono';
import { GovernanceStores } from './GovernanceStores.ts';

function toScriptErrorResponse(
  status: number,
  body: string,
): Response {
  return new Response(JSON.stringify({ error: body }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getScriptsList(c: Context) {
  const result = await GovernanceStores.scriptsStore
    .listScripts();
  if (!result.ok) {
    return toScriptErrorResponse(
      result.status,
      result.body,
    );
  }
  return c.json({ entries: result.entries });
}

const scriptPathFromUrl = (url: string): string =>
  new URL(url).pathname.replace(/^\/scripts\/?/, '') ?? '';

function toScriptContentResponse(
  content: string,
): Response {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export async function getScriptPath(c: Context) {
  const path = scriptPathFromUrl(c.req.url);
  const result = await GovernanceStores.scriptsStore
    .readScript(path);
  if (!result.ok) {
    return toScriptErrorResponse(
      result.status,
      result.body,
    );
  }
  return toScriptContentResponse(result.content);
}

export function postScriptPath(c: Context) {
  const path = scriptPathFromUrl(c.req.url);
  if (!path.trim()) {
    return c.json({ error: 'path required' }, 400);
  }
  return postScriptPathResponse(c, path);
}

async function writeScriptFromRequest(
  c: Context,
  path: string,
) {
  const content = await c.req.text();
  return GovernanceStores.scriptsStore.writeScript(
    path,
    content,
  );
}

async function postScriptPathResponse(
  c: Context,
  path: string,
): Promise<Response> {
  const result = await writeScriptFromRequest(c, path);
  if (!result.ok) {
    return toScriptErrorResponse(
      result.status,
      result.body,
    );
  }
  return c.body(null, 201);
}
