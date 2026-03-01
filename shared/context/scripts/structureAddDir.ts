// function-length-ignore-file — CI/utility script (§P reserved).
//
// Add a directory via allowlist: validate path per §D/§E/§F, mkdir, update
// config/structure_allowed_dirs.toml. Run: deno task structure:add-dir -- <path>
//

import {
  loadAllowlist,
  writeAllowlist,
} from './structureAddDirAllowlist.ts';
import { validatePath } from './structureAddDirValidate.ts';

function parseArgs(): { path: string } | { err: string } {
  const args = Deno.args.filter((a) => a !== '--');
  const pathArg = args[0];
  if (!pathArg) {
    return {
      err: 'Usage: deno task structure:add-dir -- <path>',
    };
  }
  const path = pathArg.replace(/^\/+|\/+$/g, '').replace(
    /\/+/g,
    '/',
  );
  return { path };
}

function resolvePath(
  parsed: { path: string } | { err: string },
): string {
  if ('err' in parsed) {
    console.error(parsed.err);
    Deno.exit(1);
  }
  return parsed.path;
}

function exitOnValidationFailure(
  result: { ok: true } | { ok: false; err: string },
): void {
  if (!result.ok) {
    console.error(result.err);
    Deno.exit(1);
  }
}

function validatePathAndExit(path: string): void {
  exitOnValidationFailure(validatePath(path));
}

function ensureDirExists(path: string): Promise<void> {
  return Deno.mkdir(path, { recursive: true });
}

function logAlreadyInAllowlist(path: string): void {
  console.log(`Path already in allowlist: ${path}`);
}

async function handleAlreadyInAllowlist(
  path: string,
): Promise<void> {
  logAlreadyInAllowlist(path);
  try {
    await ensureDirExists(path);
  } catch {
    // ignore
  }
}

function addPathToAllowlist(
  path: string,
  allowlist: string[],
): void {
  const next = [...allowlist, path].sort();
  writeAllowlist(next);
  console.log(
    `Created ${path} and added to config/structure_allowed_dirs.toml.`,
  );
}

async function addPathAndWrite(
  path: string,
  allowlist: string[],
): Promise<void> {
  await ensureDirExists(path);
  addPathToAllowlist(path, allowlist);
}

function pathInAllowlist(
  allowlist: string[],
  path: string,
): boolean {
  return allowlist.includes(path);
}

async function ensurePathAdded(
  path: string,
): Promise<void> {
  const allowlist = loadAllowlist();
  if (pathInAllowlist(allowlist, path)) {
    await handleAlreadyInAllowlist(path);
    return;
  }
  await addPathAndWrite(path, allowlist);
}

async function main(): Promise<void> {
  const path = resolvePath(parseArgs());
  validatePathAndExit(path);
  await ensurePathAdded(path);
}

main();
