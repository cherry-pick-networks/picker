/**
 * Layer names and allowed infix/suffix sets per store.md §E.
 */

export const LAYERS = [
  "presentation",
  "application",
  "domain",
  "infrastructure",
] as const;

export { LAYER_INFIX } from "./check-naming-layer-config-infix.ts";
export { LAYER_SUFFIX } from "./check-naming-layer-config-suffix.ts";

export const SKIP_DIRS = new Set([
  ".git",
  ".cursor",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
  ".cache",
  "tests",
  "data",
]);
