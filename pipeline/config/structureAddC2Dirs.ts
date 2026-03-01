//
// Create subdirs per CAF Component 1–4 allowlist under a path key. RULESET.md §E, §F.
// Run from project root. Idempotent: existing dirs are left as-is.
// Usage: deno run -A pipeline/structureAddC2Dirs.ts [component] [pathKey]
//   component: c1 | c2 | c3 | c4 (default c2 if pathKey given as first arg).
//   pathKey: pipeline | reporting | api (default pipeline).
//   When base is pipeline or reporting (C1 workload), create only c2/c3/c4 — use structure:add-dirs:pipeline or structure:add-dirs:reporting.
//   Backward compat: single arg "pipeline"|"reporting" → c2 + that pathKey.
//
import { dirname, join } from '@std/path';
import { fromFileUrl } from '@std/path';
import type { PathKey } from './pathConfig.ts';
import { getPath, getRoot } from './pathConfig.ts';
import {
  getComponent1Set,
  getComponent2Set,
  getComponent3Set,
  getComponent4Set,
} from './structureAddDirConfig.ts';

type ComponentKey = 'c1' | 'c2' | 'c3' | 'c4';

const PATH_KEY_ARG: Record<string, PathKey> = {
  pipeline: 'contextScripts',
  reporting: 'applicationReport',
  api: 'application',
  postgresql: 'applicationInfra',
  contextScripts: 'contextScripts',
  applicationReport: 'applicationReport',
  application: 'application',
  applicationInfra: 'applicationInfra',
};

const COMPONENT_ARG: ComponentKey[] = ['c1', 'c2', 'c3', 'c4'];

function getNamesForComponent(component: ComponentKey): string[] {
  const set =
    component === 'c1'
      ? getComponent1Set()
      : component === 'c2'
        ? getComponent2Set()
        : component === 'c3'
          ? getComponent3Set()
          : getComponent4Set();
  return [...set].sort();
}

function getRootAndBase(pathKey: PathKey): { root: string; base: string } {
  try {
    return { root: getRoot(), base: getPath(pathKey) };
  } catch {
    const scriptDir = dirname(fromFileUrl(import.meta.url));
    const configPath = join(scriptDir, 'path-config.json');
    const raw = Deno.readTextFileSync(configPath);
    const data = JSON.parse(raw) as { paths?: Record<string, string> };
    const paths = data.paths;
    const base = paths?.[pathKey];
    if (base === undefined) {
      throw new Error(
        `structureAddC2Dirs: ${configPath} has no paths.${pathKey}.`,
      );
    }
    const root =
      (scriptDir.endsWith('/config') || scriptDir.endsWith('\\config')) &&
      scriptDir.includes('pipeline')
        ? dirname(dirname(scriptDir))
        : dirname(scriptDir);
    return { root, base };
  }
}

function structureAddComponentDirs(
  component: ComponentKey,
  pathKey: PathKey,
): void {
  const { root, base } = getRootAndBase(pathKey);
  const names = getNamesForComponent(component);

  for (const name of names) {
    const dir = join(root, base, name);
    try {
      const info = Deno.statSync(dir);
      if (info.isDirectory) {
        console.log(`Already exists: ${base}/${name}`);
      } else {
        Deno.mkdirSync(dir, { recursive: true });
        console.log(`Created: ${base}/${name}`);
      }
    } catch {
      Deno.mkdirSync(dir, { recursive: true });
      console.log(`Created: ${base}/${name}`);
    }
  }
}

function parseArgs(): { component: ComponentKey; pathKey: PathKey } {
  const a0 = Deno.args[0]?.toLowerCase();
  const a1 = Deno.args[1]?.toLowerCase();
  const isPathKey = (s: string) =>
    PATH_KEY_ARG[s] !== undefined;
  const isComponent = (s: string) =>
    COMPONENT_ARG.includes(s as ComponentKey);

  if (a0 && isPathKey(a0) && !isComponent(a0)) {
    return { component: 'c2', pathKey: PATH_KEY_ARG[a0] };
  }
  const component: ComponentKey = isComponent(a0 ?? '')
    ? (a0 as ComponentKey)
    : 'c2';
  const pathKey = ((a1 && PATH_KEY_ARG[a1]) ?? 'contextScripts') as PathKey;
  return { component, pathKey };
}

function main(): void {
  const { component, pathKey } = parseArgs();
  structureAddComponentDirs(component, pathKey);
}

export default structureAddComponentDirs;
main();
