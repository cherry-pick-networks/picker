/**
 * Governance verification: must pass before any read/write of
 * shared/runtime/store/. Ensures path stays under that base and rejects
 * escapes (e.g. ..).
 */

const ALLOWED_BASE = 'shared/runtime/store';

export type GovernanceResult =
  | { allowed: true }
  | { allowed: false; reason: string };

function resolveParts(
  baseParts: string[],
  parts: string[],
): string[] | null {
  const resolved: string[] = [...baseParts];
  for (const p of parts) {
    if (p === '..') {
      if (resolved.length <= baseParts.length) return null;
      resolved.pop();
    } else if (p !== '.') resolved.push(p);
  }
  return resolved;
}

function underBase(resolved: string, baseParts: string[]): boolean {
  const basePrefix = baseParts.join('/');
  return resolved === basePrefix || resolved.startsWith(basePrefix + '/');
}

/** Normalize relative path and ensure it stays under base (no .. escape). */
function resolveUnderBase(base: string, relative: string): string | null {
  const parts = relative.split('/').filter(Boolean);
  const baseParts = base.split('/').filter(Boolean);
  const resolved = resolveParts(baseParts, parts);
  return resolved === null
    ? null
    : (underBase(resolved.join('/'), baseParts) ? resolved.join('/') : null);
}

/**
 * Verify that an operation on the given path is allowed under Governance.
 * Path is relative to repo root; must be under shared/runtime/store/.
 */
export function verifyGovernance(
  _operation: 'read' | 'write',
  path: string,
): GovernanceResult {
  const normalized = path === '' || path === '.'
    ? ALLOWED_BASE
    : resolveUnderBase(ALLOWED_BASE, path);
  if (normalized === null) {
    return {
      allowed: false,
      reason: 'Path must be under shared/runtime/store/',
    };
  }
  return { allowed: true };
}
