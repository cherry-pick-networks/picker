/**
 * Config for TS filename check (store.md §E, reference.md).
 * Allowed infix/suffix and exceptions; single source for validator.
 */

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

/** Root-level .ts files allowed as-is (fixed names). */
export const ROOT_ALLOWED = new Set([
  'main.ts',
  'vite.config.ts',
  'client.ts',
  'ts-morph.d.ts',
]);

/** system/ infix (domain folders) per reference.md. */
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
  'kv',
  'lexis',
  'mirror',
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

/** Base filename (no .ts): camelCase or PascalCase, no dot or hyphen (Airbnb / reference.md). */
export const TS_BASE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** Paths that are exempt from filename rule (exact relative path). */
export const PATH_EXCEPTIONS = new Set([
  'shared/infra/auth/entra.ts',
  'system/routes.ts',
  'system/schedule/fsrs.ts',
  'tests/system/with_temp_scripts_store.ts',
]);

/** Path prefix: no filename rule (e.g. scripts). */
export const EXEMPT_PREFIXES = ['shared/prompt/scripts/'];

/** Test file name (before _test.ts): camelCase (reference.md). */
export const TEST_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;
