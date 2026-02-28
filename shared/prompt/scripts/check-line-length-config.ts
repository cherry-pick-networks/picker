/**
 * Config for line-length and file-length check (store.md §P, 100-char).
 * Single source for file-level exemptions; document reason in comments.
 */

/** File-length exempt paths; add only when splitting not feasible (100-char effective lines). */
export const FILE_LENGTH_EXEMPT = new Set([
  'system/schedule/fsrs.ts', // ported algorithm
  'shared/prompt/scripts/check-domain-deps.ts', // CI/utility allowlist
  'system/source/sourceExtractService.ts', // extract + validate + persist
]);

// function-length-ignore
function isFileLengthExemptByPattern(rel: string): boolean {
  return rel.endsWith('_test.ts') || rel.startsWith('tests/') ||
    rel.includes('/tests/') || rel.endsWith('.test.ts') ||
    rel.endsWith('.spec.ts');
}

// function-length-ignore
/** True if exempt from file-length (test patterns or explicit list). */
export function isFileLengthExempt(rel: string): boolean {
  return isFileLengthExemptByPattern(rel) || FILE_LENGTH_EXEMPT.has(rel);
}
