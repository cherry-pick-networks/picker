/**
 * Line-length and file-length check (store.md §P).
 * - No physical line may exceed 80 chars.
 * - File effective line count (sum of ceil(len/80) per line, empty=0) ≤ 100.
 * Run: deno run --allow-read shared/prompt/scripts/check-line-length.ts
 * Or: deno task line-length-check
 */

import {
  collectTsFiles,
  collectViolations,
  FileLengthViolation,
  LineLengthViolation,
  MAX_EFFECTIVE_LINES_PER_FILE,
  MAX_LINE_LENGTH,
} from "./check-line-length-helpers.ts";

// function-length-ignore
function isFileLengthExempt(rel: string): boolean {
  return rel.endsWith("_test.ts") || rel.startsWith("tests/") ||
    rel.includes("/tests/");
}

function logViolationsAndExit(
  lineLength: LineLengthViolation[],
  fileLength: FileLengthViolation[],
): void {
  if (lineLength.length > 0) {
    console.error(
      `Line length check failed (store.md §P: max ${MAX_LINE_LENGTH} chars):`,
    );
    for (const v of lineLength) {
      console.error(`  ${v.file}:${v.line}: ${v.length} chars`);
    }
  }
  if (fileLength.length > 0) {
    console.error(
      `File length check failed (§P: max ${MAX_EFFECTIVE_LINES_PER_FILE} ` +
        "effective lines, 80-char units):",
    );
    for (const v of fileLength) {
      console.error(
        `  ${v.file}: ${v.effectiveLines} effective lines ` +
          `(max ${MAX_EFFECTIVE_LINES_PER_FILE})`,
      );
    }
  }
  Deno.exit(1);
}

function reportResult(
  lineLength: LineLengthViolation[],
  fileLength: FileLengthViolation[],
): void {
  const hasFail = lineLength.length > 0 || fileLength.length > 0;
  if (hasFail) logViolationsAndExit(lineLength, fileLength);
  if (!hasFail) {
    console.log(
      "Line length check passed: all lines ≤ 80 chars, " +
        "all files ≤ 100 effective lines (test files exempt).",
    );
  }
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files = await collectTsFiles(root);
  const { lineLength, fileLength } = await collectViolations(
    root,
    files,
    isFileLengthExempt,
  );
  reportResult(lineLength, fileLength);
}

main();
