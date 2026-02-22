/**
 * Naming-layer check: when tier 1 is a Layer (presentation, application,
 * domain, infrastructure), tier 2 and 3 must use that layer's allowed
 * Infix/Suffix per store.md §E. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-naming-layer.ts
 * Or: deno task naming-layer-check
 */
// deno-lint-ignore-file function-length/function-length

import {
  LAYER_INFIX,
  LAYER_SUFFIX,
  LAYERS,
  SKIP_DIRS,
} from "./check-naming-layer-config.ts";

async function walkDirs(
  root: string,
  dir: string,
  prefix: string,
  out: string[],
): Promise<void> {
  const full = `${root}/${dir}`.replace(/\/+/g, "/");
  let entries: Deno.DirEntry[];
  try {
    entries = Array.from(await Deno.readDir(full));
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory) continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    out.push(rel);
    await walkDirs(root, `${dir}/${e.name}`, rel, out);
  }
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const allDirs: string[] = [];
  await walkDirs(root, "", "", allDirs);
  const errors: string[] = [];
  for (const rel of allDirs) {
    const parts = rel.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    const layer = parts[0];
    if (!LAYERS.includes(layer as (typeof LAYERS)[number])) continue;
    if (parts.length >= 2 && !LAYER_INFIX[layer]?.has(parts[1])) {
      errors.push(`${rel}: infix "${parts[1]}" not in ${layer} allowed set`);
    }
    if (parts.length >= 3 && !LAYER_SUFFIX[layer]?.has(parts[2])) {
      errors.push(`${rel}: suffix "${parts[2]}" not in ${layer} allowed set`);
    }
  }
  if (errors.length > 0) {
    console.error("Layer naming check failed (store.md §E):");
    for (const e of errors) console.error("  ", e);
    Deno.exit(1);
  }
  console.log(
    "Naming-layer check passed: layer-prefixed paths use allowed infix/suffix.",
  );
}

main();
