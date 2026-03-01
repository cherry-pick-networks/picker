//
// Tier check: every directory path (except skip list) must satisfy
// Tier1~5 allowlist and length caps per RULESET §D, §E, §F.
// Run: deno task structure-tiers-check
//

import { skipDir } from './structureSkipDirs.ts';
import { validatePath } from './structureAddDirValidate.ts';

async function walkDirs(
  root: string,
  dir: string,
  prefix: string,
  out: string[],
): Promise<void> {
  const full = dir
    ? `${root}/${dir}`.replace(/\/+/g, '/')
    : root;
  const entries: Deno.DirEntry[] = [];
  try {
    for await (const e of Deno.readDir(full)) entries.push(e);
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory || skipDir(e.name, true)) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    out.push(rel);
    await walkDirs(root, `${dir}/${e.name}`.replace(/^\/+/, ''), rel, out);
  }
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const dirs: string[] = [];
  await walkDirs(root, '', '', dirs);
  const errors: string[] = [];
  for (const p of dirs) {
    const r = validatePath(p);
    if (!r.ok) errors.push(`${p}: ${r.err}`);
  }
  if (errors.length > 0) {
    console.error('Structure Tier check failed (§D/§E/§F):');
    for (const e of errors.sort()) console.error('  ', e);
    Deno.exit(1);
  }
  console.log('Structure Tier check passed: paths conform to Tier1~5.');
}

main();
