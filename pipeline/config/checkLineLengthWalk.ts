//
// TS file collection for line-length check (RULESET.md §P).
// Used by checkLineLengthHelpers.collectViolations via collectTsFiles.
//

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

export async function collectTsFiles(
  root: string,
): Promise<string[]> {
  const out: string[] = [];
  await walkTsFiles(root, root, out);
  return out;
}
