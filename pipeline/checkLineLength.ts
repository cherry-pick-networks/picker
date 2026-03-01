//
// Line-length and file-length check (RULESET.md §P).
// - No physical line may exceed 100 chars.
// - File effective line count (sum of ceil(len/100) per non-comment line) ≤ 100.
//   Comment-only lines are excluded from the count.
// Run: deno task line-length-check
//

import { isFileLengthExempt } from './checkLineLengthConfig.ts';
import {
  collectTsFiles,
  collectViolations,
  FileLengthViolation,
  LineLengthViolation,
  MAX_EFFECTIVE_LINES_PER_FILE,
  MAX_LINE_LENGTH,
} from './checkLineLengthHelpers.ts';

function logViolationsAndExit(
  lineLength: LineLengthViolation[],
  fileLength: FileLengthViolation[],
): void {
  if (lineLength.length > 0) {
    console.error(
      `Line length check failed (RULESET.md §P: max ${MAX_LINE_LENGTH} chars):`,
    );
    for (const v of lineLength) {
      console.error(
        `  ${v.file}:${v.line}: ${v.length} chars`,
      );
    }
    console.error(
      '  Run `deno fmt` to fix most issues; long strings split manually (§P).',
    );
  }
  if (fileLength.length > 0) {
    console.error(
      `File length check failed (§P: max ${MAX_EFFECTIVE_LINES_PER_FILE} ` +
        'effective lines, 100-char units):',
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
  const hasFail = lineLength.length > 0 ||
    fileLength.length > 0;
  if (hasFail) logViolationsAndExit(lineLength, fileLength);
  if (!hasFail) {
    console.log(
      'Line length check passed: all lines ≤ 100 chars, ' +
        'all files ≤ 100 effective lines (test files exempt).',
    );
  }
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files = await collectTsFiles(root);
  const { lineLength, fileLength } =
    await collectViolations(
      root,
      files,
      isFileLengthExempt,
    );
  reportResult(lineLength, fileLength);
}

main();
