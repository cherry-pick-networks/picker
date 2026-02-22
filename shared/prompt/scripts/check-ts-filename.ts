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

/** [name].[suffix].ts with name lowercase/hyphen, suffix in allowed set. */
function checkDotSuffixFile(base: string): string | null {
  if (!base.endsWith(".ts")) return null;
  const withoutExt = base.slice(0, base.length - 3);
  const lastDot = withoutExt.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === withoutExt.length - 1) return null;
  const suffix = withoutExt.slice(lastDot + 1);
  if (!ALLOWED_SUFFIX.has(suffix)) return `suffix "${suffix}" not in allowed set`;
  const name = withoutExt.slice(0, lastDot);
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
    return "name must be lowercase with optional hyphens";
  }
  return null;
}

function validate(rel: string): string | null {
  const base = rel.split("/").pop() ?? "";
  if (rel === base) {
    if (ROOT_ALLOWED.has(base)) return null;
    if (base.endsWith(".d.ts")) return null;
    return "root .ts must be in ROOT_ALLOWED or *.d.ts";
  }
  if (isExempt(rel)) return null;
  if (rel.startsWith("tests/")) {
    if (base.endsWith("_test.ts")) return null;
    return "tests/ file must end with _test.ts";
  }
  if (rel.startsWith("system/")) {
    const parts = rel.split("/");
    if (parts.length < 3) {
      if (rel === "system/routes.ts") return null;
      return "system/ file must be under system/<infix>/ or routes.ts";
    }
    const [, infix] = parts;
    if (!SYSTEM_INFIX.has(infix)) return `system infix "${infix}" not in allowed set`;
    const err = checkDotSuffixFile(base);
    if (err) return err;
    return null;
  }
  if (rel.startsWith("shared/infra/")) {
    const err = checkDotSuffixFile(base);
    if (err) return err;
    return null;
  }
  return null;
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files: string[] = [];
  await walkTsFiles(root, root, files);
  const errors: [string, string][] = [];
  for (const rel of files) {
    const err = validate(rel);
    if (err) errors.push([rel, err]);
  }
  if (errors.length > 0) {
    console.error("TS filename check failed (store.md §E, reference.md):");
    for (const [file, msg] of errors) {
      console.error(`  ${file}: ${msg}`);
    }
    Deno.exit(1);
  }
  console.log(
    "TS filename check passed: system/ and shared/infra use [name].[suffix].ts.",
  );
}

main();
