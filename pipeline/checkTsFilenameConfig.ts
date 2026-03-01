//
// Config for TS filename check (RULESET.md §E, MANUAL.md).
// No project-only allowlists; validation uses format rules only.
//

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
  'data',
]);

//  Base filename (no .ts): camelCase or PascalCase, no dot or hyphen (MANUAL.md).
export const TS_BASE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

//  Path prefixes exempt from filename rule (e.g. future use).
export const EXEMPT_PREFIXES: string[] = [];

//  Test file name (before _test.ts): camelCase (MANUAL.md).
export const TEST_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
