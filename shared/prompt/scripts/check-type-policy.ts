/**
 * Type-check policy: fail if type checking is disabled or bypassed.
 * Checks: (A) no --no-check in deno.json tasks, (B) no @ts-ignore or
 * @ts-expect-error in source, (D) no skipLibCheck/strict disabled in config.
 * Run from repo root: deno run --allow-read shared/prompt/scripts/check-type-policy.ts
 * Or: deno task type-check-policy
 */

const DENO_JSON = "deno.json";
const DENO_JSONC = "deno.jsonc";
const TSCONFIG = "tsconfig.json";

const SKIP_DIRS = new Set([
  ".cache",
  ".git",
  ".cursor",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "vendor",
  "_fresh",
  "static",
]);

const SOURCE_EXTS = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"];
/** Match line that is solely a comment directive (// or * then directive, then only whitespace). */
const DIRECTIVE_RE = /^\s*(?:\/\/|\*)\s*@ts-(?:ignore|expect-error)\s*$/;

function hasNoCheck(script: string): boolean {
  return script.includes("--no-check");
}

async function checkDenoJsonTasks(root: string): Promise<string[]> {
  const errors: string[] = [];
  let content: string;
  let path = `${root}/${DENO_JSON}`;
  try {
    content = await Deno.readTextFile(path);
  } catch {
    try {
      path = `${root}/${DENO_JSONC}`;
      content = await Deno.readTextFile(path);
    } catch {
      return errors; // no config
    }
  }
  let data: { tasks?: Record<string, string> };
  try {
    data = JSON.parse(content) as { tasks?: Record<string, string> };
  } catch {
    errors.push(`${path}: invalid JSON`);
    return errors;
  }
  const tasks = data.tasks ?? {};
  for (const [name, script] of Object.entries(tasks)) {
    if (typeof script === "string" && hasNoCheck(script)) {
      errors.push(`deno.json task "${name}" must not use --no-check`);
    }
  }
  return errors;
}

async function checkCompilerOptions(root: string): Promise<string[]> {
  const errors: string[] = [];
  const check = (path: string, opts: Record<string, unknown> | undefined) => {
    if (!opts || typeof opts !== "object") return;
    if (opts.skipLibCheck === true) {
      errors.push(`${path}: compilerOptions.skipLibCheck must not be true`);
    }
    if (opts.strict === false) {
      errors.push(`${path}: compilerOptions.strict must not be false`);
    }
  };
  for (const configFile of [DENO_JSON, DENO_JSONC, TSCONFIG]) {
    const path = `${root}/${configFile}`;
    let content: string;
    try {
      content = await Deno.readTextFile(path);
    } catch {
      continue;
    }
    try {
      const data = JSON.parse(content) as {
        compilerOptions?: Record<string, unknown>;
      };
      check(path, data.compilerOptions);
    } catch {
      // ignore parse errors; other tooling will report
    }
  }
  return errors;
}

async function walkSourceFiles(
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
      const ext = e.name.includes(".") ? "." + e.name.split(".").pop()! : "";
      if (SOURCE_EXTS.includes(ext)) files.push(rel);
    }
  }
  return files;
}

function checkSourceFile(path: string, content: string): string[] {
  const errors: string[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    DIRECTIVE_RE.lastIndex = 0;
    if (DIRECTIVE_RE.test(line)) {
      const match = line.match(/@ts-(ignore|expect-error)/i);
      errors.push(
        `${path}:${i + 1}: forbidden ${
          match ? match[0]!.toLowerCase() : "directive"
        }`,
      );
    }
  }
  return errors;
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const allErrors: string[] = [];

  const taskErrors = await checkDenoJsonTasks(root);
  allErrors.push(...taskErrors);

  const optErrors = await checkCompilerOptions(root);
  allErrors.push(...optErrors);

  const sourceFiles = await walkSourceFiles(root, root);
  for (const rel of sourceFiles) {
    const content = await Deno.readTextFile(`${root}/${rel}`);
    const fileErrors = checkSourceFile(rel, content);
    allErrors.push(...fileErrors);
  }

  if (allErrors.length > 0) {
    console.error(
      "Type-check policy violation(s). Do not disable or bypass type checking (see §N in shared-prompt-store.md).",
    );
    for (const e of allErrors) console.error("  " + e);
    Deno.exit(1);
  }

  console.log("Type-check policy passed: no bypass or disable detected.");
}

main();
