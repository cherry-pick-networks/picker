//  Scripts store: write file. Used by scriptsStore.ts.

import type { WriteResult } from './scriptsTypes.ts';

function getParentDir(fullPath: string): string {
  return fullPath.slice(0, fullPath.lastIndexOf('/'));
}

function ensureParentDir(fullPath: string): Promise<void> {
  const dir = getParentDir(fullPath);
  if (dir) return Deno.mkdir(dir, { recursive: true });
  return Promise.resolve();
}

function toWriteError(e: unknown): WriteResult {
  const body = e instanceof Error
    ? e.message
    : 'write failed';
  return { ok: false, status: 500, body };
}

async function writeFileToPath(
  fullPath: string,
  content: string,
): Promise<WriteResult> {
  await Deno.writeTextFile(fullPath, content, {
    create: true,
  });
  return { ok: true, status: 201 };
}

async function doWrite(
  fullPath: string,
  content: string,
): Promise<WriteResult> {
  await ensureParentDir(fullPath);
  return writeFileToPath(fullPath, content);
}

export async function writeScriptAllowed(
  fullPath: string,
  content: string,
): Promise<WriteResult> {
  const result = await doWrite(fullPath, content).catch((
    e,
  ) => toWriteError(e));
  return result;
}
