/**
 * Config for TS filename check (store.md §E, reference.md).
 * Allowed infix/suffix and exceptions; single source for validator.
 */

export const SKIP_DIRS = new Set([
  ".git",
  ".cursor",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
  ".cache",
  "temp",
  "data",
]);

/** Root-level .ts files allowed as-is (fixed names). */
export const ROOT_ALLOWED = new Set([
  "main.ts",
  "vite.config.ts",
  "client.ts",
  "ts-morph.d.ts",
]);

/** system/ infix (domain folders) per reference.md. */
export const SYSTEM_INFIX = new Set([
  "actor",
  "app",
  "audit",
  "concept",
  "content",
  "kv",
  "record",
  "script",
  "source",
]);

/** Allowed suffix for [name].[suffix].ts (reference.md, store.md §E). */
export const ALLOWED_SUFFIX = new Set([
  "endpoint",
  "service",
  "store",
  "schema",
  "types",
  "transfer",
  "client",
  "validation",
  "log",
  "config",
]);

/** Paths that are exempt from [name].[suffix].ts rule (exact relative path). */
export const PATH_EXCEPTIONS = new Set([
  "system/routes.ts",
  "tests/system/with_temp_scripts_store.ts",
]);

/** Path prefix: no filename rule (e.g. scripts). */
export const EXEMPT_PREFIXES = ["shared/prompt/scripts/"];

/** Test file name (before _test.ts) must be lowercase + hyphens only (§E). */
export const TEST_NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
