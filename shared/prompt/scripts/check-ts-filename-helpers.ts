/**
 * Helpers for TS filename check: walk and parse [name].[suffix].
 * Used by check-ts-filename.ts and check-ts-filename-validate.ts.
 */

import { ALLOWED_SUFFIX, SKIP_DIRS } from "./check-ts-filename-config.ts";

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
    } else if (e.isFile && e.name.endsWith(".ts")) {
      out.push(rel);
    }
  }
}

export function getWithoutExt(base: string): string | null {
  if (!base.endsWith(".ts")) return null;
  return base.slice(0, base.length - 3);
}

export function parseDotSuffix(
  withoutExt: string,
): { name: string; suffix: string } | null {
  const lastDot = withoutExt.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === withoutExt.length - 1) return null;
  return {
    name: withoutExt.slice(0, lastDot),
    suffix: withoutExt.slice(lastDot + 1),
  };
}

export function checkSuffixAndName(
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

export function parseDotSuffixBase(
  base: string,
): { name: string; suffix: string } | null {
  const w = getWithoutExt(base);
  if (!w) return null;
  return parseDotSuffix(w);
}
