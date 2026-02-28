/**
 * Type-check policy shared constants and source-file checks.
 * Used by check-type-policy.ts and check-type-policy-config.ts.
 */

export const DENO_JSON = 'deno.json';
export const DENO_JSONC = 'deno.jsonc';
export const TSCONFIG = 'tsconfig.json';

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

export const SOURCE_EXTS = ['.ts', '.tsx', '.mts', '.js', '.jsx', '.mjs'];
/** Match line: comment then @ts-ignore/expect-error, then whitespace. */
export const DIRECTIVE_RE = /^\s*(?:\/\/|\*)\s*@ts-(?:ignore|expect-error)\s*$/;

export async function walkSourceFiles(
  root: string,
  dir: string,
  files: string[] = [],
): Promise<string[]> {
  for await (const e of Deno.readDir(dir)) {
    const full = `${dir}/${e.name}`;
    const rel = full.slice(root.length + 1);
    if (e.isDirectory) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walkSourceFiles(root, full, files);
    } else if (e.isFile) {
      const ext = e.name.includes('.') ? '.' + e.name.split('.').pop()! : '';
      if (SOURCE_EXTS.includes(ext)) files.push(rel);
    }
  }
  return files;
}

export function checkSourceFile(path: string, content: string): string[] {
  const errors: string[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    DIRECTIVE_RE.lastIndex = 0;
    if (DIRECTIVE_RE.test(line)) {
      const match = line.match(/@ts-(ignore|expect-error)/i);
      errors.push(
        `${path}:${i + 1}: forbidden ${
          match ? match[0]!.toLowerCase() : 'directive'
        }`,
      );
    }
  }
  return errors;
}
