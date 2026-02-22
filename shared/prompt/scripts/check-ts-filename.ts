/**
 * TS filename check: system/ and shared/infra use [name].[suffix].ts per
 * store.md §E and reference.md. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-ts-filename.ts
 * Or: deno task ts-filename-check
 */
import {
  ALLOWED_SUFFIX,
  EXEMPT_PREFIXES,
  PATH_EXCEPTIONS,
  ROOT_ALLOWED,
  SKIP_DIRS,
  SYSTEM_INFIX,
} from "./check-ts-filename-config.ts";

async function walkTsFiles(
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
    } else if (e.isFile && e.name.endsWith(".ts")) {
      out.push(rel);
    }
  }
}

function isExempt(rel: string): boolean {
  if (PATH_EXCEPTIONS.has(rel)) return true;
  for (const p of EXEMPT_PREFIXES) {
    if (rel.startsWith(p)) return true;
  }
  return false;
}

function getWithoutExt(base: string): string | null {
  if (!base.endsWith(".ts")) return null;
  return base.slice(0, base.length - 3);
}

function parseDotSuffix(
  withoutExt: string,
): { name: string; suffix: string } | null {
  const lastDot = withoutExt.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === withoutExt.length - 1) return null;
  return {
    name: withoutExt.slice(0, lastDot),
    suffix: withoutExt.slice(lastDot + 1),
  };
}

function checkSuffixAndName(
  p: { name: string; suffix: string },
): string | null {
  if (!ALLOWED_SUFFIX.has(p.suffix)) {
    return `suffix "${p.suffix}" not in allowed set`;
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(p.name)) {
    return "name must be lowercase with optional hyphens";
  }
  return null;
}

function parseDotSuffixBase(
  base: string,
): { name: string; suffix: string } | null {
  const w = getWithoutExt(base);
  if (!w) return null;
  return parseDotSuffix(w);
}

/** [name].[suffix].ts with name lowercase/hyphen, suffix in allowed set. */
function checkDotSuffixFile(base: string): string | null {
  const p = parseDotSuffixBase(base);
  if (!p) return null;
  return checkSuffixAndName(p);
}

function validateRoot(base: string): string | null {
  if (ROOT_ALLOWED.has(base)) return null;
  if (base.endsWith(".d.ts")) return null;
  return "root .ts must be in ROOT_ALLOWED or *.d.ts";
}

function validateTests(base: string): string | null {
  if (base.endsWith("_test.ts")) return null;
  return "tests/ file must end with _test.ts";
}

function validateSystemRoot(rel: string): string | null {
  const ok = rel === "system/routes.ts";
  return ok ? null : "system/ file must be under system/<infix>/ or routes.ts";
}

function validateSystemInfix(parts: string[], base: string): string | null {
  const [, infix] = parts;
  if (!SYSTEM_INFIX.has(infix ?? "")) {
    return `system infix "${infix}" not in allowed set`;
  }
  return checkDotSuffixFile(base);
}

function validateSystem(rel: string, base: string): string | null {
  const parts = rel.split("/");
  if (parts.length < 3) return validateSystemRoot(rel);
  return validateSystemInfix(parts, base);
}

function validateRest(rel: string, base: string): string | null {
  if (rel.startsWith("tests/")) return validateTests(base);
  if (rel.startsWith("system/")) return validateSystem(rel, base);
  if (rel.startsWith("shared/infra/")) return checkDotSuffixFile(base);
  return null;
}

function validate(rel: string): string | null {
  const base = rel.split("/").pop() ?? "";
  if (rel === base) return validateRoot(base);
  if (isExempt(rel)) return null;
  return validateRest(rel, base);
}

async function collectFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  await walkTsFiles(root, root, files);
  return files;
}

function collectErrors(files: string[]): [string, string][] {
  const withErrors = files.map(
    (rel) => [rel, validate(rel)] as [string, string | null],
  );
  return withErrors.filter(([, e]) => e != null) as [string, string][];
}

function reportAndExit(errors: [string, string][]): void {
  if (errors.length > 0) {
    console.error("TS filename check failed (store.md §E, reference.md):");
    for (const [file, msg] of errors) console.error(`  ${file}: ${msg}`);
    Deno.exit(1);
  }
  console.log(
    "TS filename check passed: system/ and shared/infra use " +
      "[name].[suffix].ts.",
  );
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files = await collectFiles(root);
  const errors = collectErrors(files);
  reportAndExit(errors);
}

main();
