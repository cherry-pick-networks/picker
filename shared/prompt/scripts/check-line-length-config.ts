/**
 * Config for line-length and file-length check (store.md §P).
 * Single source for file-level exemptions; document reason in comments.
 */

/** File-length exempt paths; add only when splitting not feasible. */
export const FILE_LENGTH_EXEMPT = new Set([
  "system/schedule/fsrs.ts", // ported algorithm
  "shared/prompt/scripts/check-domain-deps.ts", // CI/utility allowlist
]);

/** Line-length exempt (whole file). Prefer inline // line-length-ignore. */
export const LINE_LENGTH_EXEMPT_FILES = new Set<string>([]);

// function-length-ignore
function isFileLengthExemptByPattern(rel: string): boolean {
  return rel.endsWith("_test.ts") || rel.startsWith("tests/") ||
    rel.includes("/tests/") || rel.endsWith(".test.ts") ||
    rel.endsWith(".spec.ts");
}

// function-length-ignore
/** True if exempt from file-length (test patterns or explicit list). */
export function isFileLengthExempt(rel: string): boolean {
  return isFileLengthExemptByPattern(rel) || FILE_LENGTH_EXEMPT.has(rel);
}

// function-length-ignore
/** True if file is exempt from line-length check entirely (rare). */
export function isLineLengthExemptFile(rel: string): boolean {
  return LINE_LENGTH_EXEMPT_FILES.has(rel);
}
