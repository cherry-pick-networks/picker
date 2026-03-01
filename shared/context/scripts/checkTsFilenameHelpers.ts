//
// Helpers for TS filename check (RULESET.md §E, MANUAL.md, Airbnb style).
// Used by checkTsFilename.ts and checkTsFilenameValidate.ts.
//

import {
  SKIP_DIRS,
  TS_BASE_NAME_REGEX,
} from './checkTsFilenameConfig.ts';

export async function walkTsFiles(
  root: string,
  dir: string,
  out: string[],
): Promise<void> {
  const entries = await Array.fromAsync(Deno.readDir(dir));
  for (const e of entries) {
    const full = `${dir}/${e.name}`;
    const rel = full.slice(root.length + 1);
    if (e.isDirectory) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walkTsFiles(root, full, out);
    } else if (e.isFile && e.name.endsWith('.ts')) {
      out.push(rel);
    }
  }
}

//  Base name (without .ts) must be camelCase or PascalCase; no dot or hyphen.
export function checkTsBaseName(
  base: string,
): string | null {
  if (!base.endsWith('.ts')) return null;
  const name = base.slice(0, base.length - 3);
  if (TS_BASE_NAME_REGEX.test(name)) return null;
  return 'TS filename base must be camelCase or PascalCase (no dot or hyphen)';
}
