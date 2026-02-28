/**
 * Helpers for line-length and file-length check (store.md §P).
 * Used by check-line-length.ts.
 */

export const MAX_LINE_LENGTH = 100;
export const MAX_EFFECTIVE_LINES_PER_FILE = 100;

export const SKIP_DIRS = new Set([
  '.cache',
  '.git',
  '.cursor',
  'node_modules',
  'dist',
  'build',
  'coverage',
  'vendor',
  'temp',
]);

export async function walkTsFiles(
  root: string,
  dir: string,
  out: string[],
): Promise<void> {
  const entries = await Array.fromAsync(Deno.readDir(dir));
  for (const e of entries) {
    const full = `${dir}/${e.name}`;
    const rel = full.slice(root.length + 1);
    if (e.isDirectory) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walkTsFiles(root, full, out);
    } else if (e.isFile && e.name.endsWith('.ts')) {
      out.push(rel);
    }
  }
}

export async function collectTsFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  await walkTsFiles(root, root, out);
  return out;
}

export interface LineLengthViolation {
  file: string;
  line: number;
  length: number;
}

export interface FileLengthViolation {
  file: string;
  effectiveLines: number;
}

// function-length-ignore
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
        lineLength.push({ file: rel, line: i + 1, length: len });
      }
    }
    if (isFileLengthExempt?.(rel)) continue;
    const effective = effectiveLineCount(lines);
    if (effective > MAX_EFFECTIVE_LINES_PER_FILE) {
      fileLength.push({ file: rel, effectiveLines: effective });
    }
  }
  return { lineLength, fileLength };
}
