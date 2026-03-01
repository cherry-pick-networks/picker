//  Scripts store: base path. Used by scriptsStore, scriptsStoreRead, scriptsStoreWrite.

import { getPath } from '#context/scripts/pathConfig.ts';

export function getScriptsBase(): string {
  const base = Deno.env.get('SCRIPTS_BASE') ??
    getPath('runtimeStore');
  return base;
}
