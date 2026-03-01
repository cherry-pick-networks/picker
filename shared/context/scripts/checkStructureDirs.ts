// function-length-ignore-file — CI/utility script (§P reserved).
//
// Structure dir check: every directory (except skip list) must be in
// config/structure_allowed_dirs.toml. Run: deno task structure-dir-check
//

import { join } from '@std/path';
import { parse } from '@std/toml';
import { getPath, getRoot } from './pathConfig.ts';
import { skipDir } from './structureSkipDirs.ts';

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
    for await (const e of Deno.readDir(full)) {
      entries.push(e);
    }
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory) continue;
    if (skipDir(e.name, true)) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    out.push(rel);
    await walkDirs(
      root,
      `${dir}/${e.name}`.replace(/^\/+/, ''),
      rel,
      out,
    );
  }
}

function allowlistPath(): string {
  return join(getRoot(), getPath('config'), 'structure_allowed_dirs.toml');
}

function parseAllowlistRaw(raw: string): string[] {
  const data = parse(raw) as { allowed?: string[] };
  return Array.isArray(data.allowed) ? data.allowed : [];
}

function loadAllowlist(): Set<string> {
  const raw = Deno.readTextFileSync(allowlistPath());
  const arr = parseAllowlistRaw(raw);
  return new Set(arr);
}

function collectMissingDirs(
  dirs: string[],
  allowlist: Set<string>,
): string[] {
  const missing: string[] = [];
  for (const d of dirs) {
    if (!allowlist.has(d)) missing.push(d);
  }
  return missing;
}

function reportMissing(missing: string[]): void {
  const msg =
    'Structure dir check failed: dirs not in config/structure_allowed_dirs.toml. ' +
    'Create only via: deno task structure:add-dir -- <path>';
  console.error(msg);
  for (const m of missing.sort()) console.error('  ', m);
}

function reportMissingAndExit(missing: string[]): never {
  reportMissing(missing);
  Deno.exit(1);
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const dirs: string[] = [];
  await walkDirs(root, '', '', dirs);
  const allowlist = loadAllowlist();
  const missing = collectMissingDirs(dirs, allowlist);
  if (missing.length > 0) reportMissingAndExit(missing);
}

main();
