// function-length-ignore-file — CI/utility (§P reserved).
//
// Config for logical structure check: component roots, public API
// patterns, dependency matrix. Single source for MANUAL.md § Per-domain
// public API and Domain dependency.
//

import { getPath, getRoot } from './pathConfig.ts';
import type { PathKey } from './pathConfig.ts';

export const COMPONENT_PATH_KEYS: PathKey[] = [
  'applicationApp',
  'applicationContent',
  'applicationGovernance',
  'applicationIdentity',
  'applicationReport',
  'applicationStorage',
  'applicationInfra',
  'applicationLogicApp',
];

/** Root-relative path → component path key (longest prefix match). */
export function getComponentRoots(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of COMPONENT_PATH_KEYS) {
    out[key] = getPath(key);
  }
  return out;
}

/** Path keys that participate in acyclic dependency check (MANUAL matrix). */
export const DEPENDENCY_DOMAIN_KEYS: PathKey[] = [
  'applicationIdentity',
  'applicationGovernance',
  'applicationContent',
  'applicationReport',
];

export const PATH_KEY_TO_DOMAIN: Record<string, string> = {
  applicationIdentity: 'identity',
  applicationGovernance: 'governance',
  applicationContent: 'content',
  applicationReport: 'report',
};

/** [fromDomain, toDomain] allowed by MANUAL.md Domain dependency matrix. */
export const ALLOWED_EDGES: [string, string][] = [
  ['content', 'governance'],
  ['identity', 'governance'],
  ['identity', 'content'],
  ['report', 'identity'],
  ['report', 'governance'],
];

/** Public entry: cross-component import allowed only if target matches. */
const PUBLIC_SUFFIXES = [
  /Endpoint\.ts$/i,
  /OpenApi\.ts$/i,
  /register.*Routes\.ts$/i,
];

export function isPublicEntry(
  rootRelativePath: string,
  componentRoot: string,
): boolean {
  if (!rootRelativePath.startsWith(componentRoot + '/')) return false;
  const rel = rootRelativePath.slice(componentRoot.length + 1);
  return PUBLIC_SUFFIXES.some((re) => re.test(rel));
}

export function whichComponent(
  rootRelativePath: string,
  roots: Record<string, string>,
): string | null {
  const sorted = Object.entries(roots).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [key, root] of sorted) {
    if (
      rootRelativePath === root ||
      rootRelativePath.startsWith(root + '/')
    ) {
      return key;
    }
  }
  return null;
}

export function resolveImportToRootRelative(
  fromRootRel: string,
  spec: string,
  root: string,
): string | null {
  if (spec.startsWith('#api/')) {
    return 'api/' + spec.slice(6);
  }
  if (spec.startsWith('#identity/')) {
    return 'identity/' + spec.slice(10);
  }
  if (spec.startsWith('#reporting/')) {
    return 'reporting/' + spec.slice(11);
  }
  if (spec.startsWith('#analytics/')) {
    return 'analytics/' + spec.slice(11);
  }
  if (spec.startsWith('../') || spec.startsWith('./')) {
    const fromDir = fromRootRel.includes('/')
      ? fromRootRel.slice(0, fromRootRel.lastIndexOf('/'))
      : '';
    const parts = fromDir ? fromDir.split('/') : [];
    for (const seg of spec.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg !== '.') parts.push(seg);
    }
    return parts.join('/');
  }
  return null;
}

export function getRootDir(): string {
  return getRoot();
}
