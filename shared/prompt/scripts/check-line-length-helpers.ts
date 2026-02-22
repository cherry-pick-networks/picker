/**
 * Helpers for line-length and file-length check (store.md §P).
 * Used by check-line-length.ts.
 */

export const MAX_LINE_LENGTH = 80;
export const MAX_EFFECTIVE_LINES_PER_FILE = 100;

export interface LineLengthViolation {
  file: string;
  line: number;
  length: number;
}

export interface FileLengthViolation {
  file: string;
  effectiveLines: number;
}

export function effectiveLineCount(lines: string[]): number {
  return lines.reduce(
    (sum, line) => sum + Math.ceil(line.length / MAX_LINE_LENGTH),
    0,
  );
}

export type ViolationsResult = {
  lineLength: LineLengthViolation[];
  fileLength: FileLengthViolation[];
};

export async function collectViolations(
  root: string,
  files: string[],
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
        lineLength.push({ file: rel, line: i + 1, length: len });
      }
    }
    const effective = effectiveLineCount(lines);
    if (effective > MAX_EFFECTIVE_LINES_PER_FILE) {
      fileLength.push({ file: rel, effectiveLines: effective });
    }
  }
  return { lineLength, fileLength };
}
