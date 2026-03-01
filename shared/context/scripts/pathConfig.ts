// function-length-ignore-file — CI/utility script (§P reserved).
//
// Path config: read directory/file paths from config/path-config.json "paths" (single source).
// Root-relative paths; use when cwd is project root.
//

import { dirname } from '@std/path';

export type PathKey =
  | 'root'
  | 'config'
  | 'system'
  | 'shared'
  | 'context'
  | 'contextScripts'
  | 'contextDocs'
  | 'scripts'
  | 'tests'
  | 'store'
  | 'todo'
  | 'handoff'
  | 'infra'
  | 'infraSchema'
  | 'infraSeed'
  | 'infraMapping'
  | 'infraSeedOntology'
  | 'infraSeedMaterial'
  | 'recordReference'
  | 'runtimeStore'
  | 'systemApp'
  | 'systemContent'
  | 'systemGovernance'
  | 'systemIdentity'
  | 'systemInfra'
  | 'systemReport';

const CONFIG_REL = 'config/path-config.json';

interface PathConfigFile {
  paths?: Record<string, string>;
}

function findPathConfig(cwd: string): string | null {
  const candidate = `${cwd}/${CONFIG_REL}`;
  try {
    Deno.statSync(candidate);
    return candidate;
  } catch {
    const parent = `${cwd}/..`;
    const parentResolved = Deno.realPathSync(parent);
    if (parentResolved === Deno.realPathSync(cwd)) {
      return null;
    }
    return findPathConfig(parentResolved);
  }
}

let cachedRoot: string | null = null;
let cachedPaths: Record<string, string> | null = null;

function loadPathConfig(): { root: string; paths: Record<string, string> } {
  const cwd = Deno.cwd();
  const path = findPathConfig(cwd);
  if (!path) {
    throw new Error(
      `pathConfig: ${CONFIG_REL} not found from ${cwd}. Run from project root.`,
    );
  }
  const root = dirname(dirname(path));
  const raw = Deno.readTextFileSync(path);
  const data = JSON.parse(raw) as PathConfigFile;
  if (!data.paths || typeof data.paths !== 'object') {
    throw new Error(
      `pathConfig: "${path}" has no "paths" object. Add paths to ${CONFIG_REL}.`,
    );
  }
  return { root, paths: data.paths as Record<string, string> };
}

function ensureCached(): void {
  if (cachedRoot !== null && cachedPaths !== null) return;
  const { root, paths } = loadPathConfig();
  cachedRoot = root;
  cachedPaths = paths;
}

//  Project root (absolute path); directory that contains config/.
export function getRoot(): string {
  ensureCached();
  return cachedRoot as string;
}

//  All path key → root-relative path.
export function getPaths(): Record<string, string> {
  ensureCached();
  return { ...(cachedPaths as Record<string, string>) };
}

//  Single path by key; throws if key missing.
export function getPath(key: PathKey): string {
  const paths = getPaths();
  const value = paths[key];
  if (value === undefined) {
    throw new Error(
      `pathConfig: path key "${key}" not in ${CONFIG_REL} paths.`,
    );
  }
  return value;
}
