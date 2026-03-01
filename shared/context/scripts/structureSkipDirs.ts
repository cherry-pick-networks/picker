//
// Skip lists for structure-dir-check and dir walk (§F). No Layer dependency.
//

/** Directory names skipped by structure-dir-check (RULESET §F). */
export const SKIP_DIRS = new Set([
  '.git',
  '.cursor',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'vendor',
  '.cache',
  'temp',
  'tests',
  'data',
]);

/** Extra names skipped by structure-dir-check only (tooling/config). */
export const SKIP_EXTRA = new Set([
  '.githooks',
  '.github',
  '.vscode',
  'scripts',
]);

export function skipDir(name: string, includeExtra = false): boolean {
  return SKIP_DIRS.has(name) || (includeExtra && SKIP_EXTRA.has(name));
}
