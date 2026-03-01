//
// Config for line-length and file-length check (RULESET.md §P, 100-char).
// Single source for file-level exemptions; paths from config/path-config.json where applicable.
//
import { getPath } from './pathConfig.ts';

//  File-length exempt paths; add only when splitting not feasible (100-char effective lines).
export const FILE_LENGTH_EXEMPT = new Set([
  'system/identity/schedule/fsrs.ts', // ported algorithm
  `${getPath('contextScripts')}/checkDomainDeps.ts`, // CI/utility allowlist
  `${getPath('contextScripts')}/commentToSingleLine.ts`, // one-off migration script
  `${
    getPath('contextScripts')
  }/rewriteMergeAtTagBoundaries.ts`, // one-off rewrite script
  'system/content/material/extractService.ts', // extract + validate + persist
]);

function isFileLengthExemptByPattern(rel: string): boolean {
  return rel.endsWith('_test.ts') ||
    rel.startsWith('tests/') ||
    rel.includes('/tests/') || rel.endsWith('.test.ts') ||
    rel.endsWith('.spec.ts');
}

//  True if exempt from file-length (test patterns or explicit list).
export function isFileLengthExempt(rel: string): boolean {
  return isFileLengthExemptByPattern(rel) ||
    FILE_LENGTH_EXEMPT.has(rel);
}
