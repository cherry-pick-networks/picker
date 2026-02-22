/**
 * Line-length check: fail if any TS source line exceeds 80 chars (store.md §P).
 * Run: deno run --allow-read shared/prompt/scripts/check-line-length.ts
 * Or: deno task line-length-check
 */
// deno-lint-ignore-file function-length/function-length

const MAX_LINE_LENGTH = 80;
const SKIP_DIRS = new Set([
  ".cache",
  ".git",
  ".cursor",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
]);

async function walkTsFiles(
  root: string,
  dir: string,
  out: string[],
): Promise<void> {
  for await (const e of Deno.readDir(dir)) {
    const full = `${dir}/${e.name}`;
    const rel = full.slice(root.length + 1);
    if (e.isDirectory) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walkTsFiles(root, full, out);
    } else if (e.isFile && e.name.endsWith(".ts")) {
      out.push(rel);
    }
  }
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files: string[] = [];
  await walkTsFiles(root, root, files);
  const violations: { file: string; line: number; length: number }[] = [];
  for (const rel of files) {
    const path = `${root}/${rel}`;
    const content = await Deno.readTextFile(path);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const len = lines[i]!.length;
      if (len > MAX_LINE_LENGTH) {
        violations.push({ file: rel, line: i + 1, length: len });
      }
    }
  }
  if (violations.length > 0) {
    console.error(
      `Line length check failed (store.md §P: max ${MAX_LINE_LENGTH} chars):`,
    );
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}: ${v.length} chars`);
    }
    Deno.exit(1);
  }
  console.log("Line length check passed: all lines ≤ 80 characters.");
}

main();
