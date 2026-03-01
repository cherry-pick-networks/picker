//  Scripts store: read file. Used by scriptsStore.ts.

import type { ReadResult } from './scriptsTypes.ts';
import { getScriptsBase } from './scriptsStoreBase.ts';

function readScriptCatch(e: unknown): ReadResult {
  if (e instanceof Deno.errors.NotFound) {
    return { ok: false, status: 404, body: 'Not found' };
  }
  const body = e instanceof Error
    ? e.message
    : 'read failed';
  return { ok: false, status: 500, body };
}

async function readFileContent(
  fullPath: string,
): Promise<ReadResult> {
  const result = await Deno.readTextFile(fullPath).catch(
    (e): ReadResult => readScriptCatch(e),
  );
  return typeof result === 'string'
    ? { ok: true, content: result }
    : result;
}

export async function readScriptAllowed(
  relativePath: string,
): Promise<ReadResult> {
  const fullPath = `${getScriptsBase()}/${relativePath}`;
  return await readFileContent(fullPath);
}
