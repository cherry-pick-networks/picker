//  Scripts store: list directory. Used by scriptsStore.ts.

import type { ListResult } from './scriptsTypes.ts';
import { getScriptsBase } from './scriptsStoreBase.ts';

function pushEntry(
  names: string[],
  e: Deno.DirEntry,
): void {
  if (e.name.startsWith('.')) return;
  names.push(e.isFile ? e.name : `${e.name}/`);
}

async function listDir(path: string): Promise<string[]> {
  const names: string[] = [];
  for await (const e of Deno.readDir(path)) {
    pushEntry(names, e);
  }
  return names.sort();
}

function toListError(e: unknown): ListResult {
  const body = e instanceof Error
    ? e.message
    : 'list failed';
  return { ok: false, status: 500, body };
}

export async function listScriptsAllowed(): Promise<
  ListResult
> {
  const base = getScriptsBase();
  try {
    const entries = await listDir(base);
    return { ok: true, entries };
  } catch (e) {
    return toListError(e);
  }
}
