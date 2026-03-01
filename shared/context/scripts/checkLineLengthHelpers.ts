//
// Helpers for line-length and file-length check (RULESET.md §P).
// Used by checkLineLength.ts.
// Effective line count excludes comment-only lines.
//
import { isCommentOnlyLine } from './checkLineLengthComment.ts';

export const MAX_LINE_LENGTH = 100;
export const MAX_EFFECTIVE_LINES_PER_FILE = 100;

export { collectTsFiles } from './checkLineLengthWalk.ts';

export interface LineLengthViolation {
  file: string;
  line: number;
  length: number;
}

export interface FileLengthViolation {
  file: string;
  effectiveLines: number;
}

export { isCommentOnlyLine } from './checkLineLengthComment.ts';

//
// Effective line count (ceil(len/100) per line). Comment-only lines excluded.
//
export function effectiveLineCount(
  lines: string[],
): number {
  let sum = 0;
  for (const line of lines) {
    if (!isCommentOnlyLine(line)) {
      sum += Math.ceil(line.length / MAX_LINE_LENGTH);
    }
  }
  return sum;
}

export type ViolationsResult = {
  lineLength: LineLengthViolation[];
  fileLength: FileLengthViolation[];
};

export async function collectViolations(
  root: string,
  files: string[],
  isFileLengthExempt?: (rel: string) => boolean,
): Promise<ViolationsResult> {
  const lineLength: LineLengthViolation[] = [];
  const fileLength: FileLengthViolation[] = [];
  for (const rel of files) {
    const path = `${root}/${rel}`;
    const content = await Deno.readTextFile(path);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const len = lines[i]!.length;
      if (len > MAX_LINE_LENGTH) {
        lineLength.push({
          file: rel,
          line: i + 1,
          length: len,
        });
      }
    }
    if (isFileLengthExempt?.(rel)) continue;
    const effective = effectiveLineCount(lines);
    if (effective > MAX_EFFECTIVE_LINES_PER_FILE) {
      fileLength.push({
        file: rel,
        effectiveLines: effective,
      });
    }
  }
  return { lineLength, fileLength };
}
