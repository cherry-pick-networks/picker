//
// Config for TS filename check (RULESET.md §E, MANUAL.md).
// Allowed infix/suffix and exceptions; paths from config/path-config.json via pathConfig.
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

//  Root-level .ts files allowed as-is (fixed names).
export const ROOT_ALLOWED = new Set([
  'main.ts',
  'vite.config.ts',
  'client.ts',
  'ts-morph.d.ts',
]);

//  system/ infix (domain folders) per MANUAL.md.
export const SYSTEM_INFIX = new Set([
  'actor',
  'app',
  'audit',
  'batch',
  'concept',
  'content',
  'data',
  'export',
  'governance',
  'identity',
  'infra',
  'kv',
  'lexis',
  'core',
  'notification',
  'record',
  'report',
  'schedule',
  'script',
  'source',
  'storage',
  'sync',
  'workflow',
]);

//  Base filename (no .ts): camelCase or PascalCase, no dot or hyphen (Airbnb / MANUAL.md).
export const TS_BASE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

//  Paths that are exempt from filename rule (exact relative path).
export const PATH_EXCEPTIONS = new Set([
  'system/routes.ts',
  'system/routesList.ts',
  'system/routesListPart1.ts',
  'system/routesListPart2.ts',
  'system/routesListPart2A.ts',
  'system/routesListPart2B1.ts',
  'system/routesListPart2B2.ts',
  'system/identity/fsrs.ts',
  'tests/system/with_temp_scripts_store.ts',
]);

//  Path prefix: no filename rule. shared/context/scripts/ is now checked per §E.
export const EXEMPT_PREFIXES: string[] = [];

//  Test file name (before _test.ts): camelCase (MANUAL.md).
export const TEST_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
