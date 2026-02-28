/**
 * Naming-layer check: when tier 1 is a Layer (presentation, application,
 * domain, infrastructure), tier 2 and 3 must use that layer's allowed
 * Infix/Suffix per store.md §E. Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-naming-layer.ts
 * Or: deno task naming-layer-check
 */
import { LAYER_INFIX, LAYER_SUFFIX, LAYERS, SKIP_DIRS } from './check-naming-layer-config.ts';

async function walkOneDir(
  root: string,
  dir: string,
  prefix: string,
  out: string[],
  e: Deno.DirEntry,
): Promise<void> {
  if (!e.isDirectory || SKIP_DIRS.has(e.name)) return;
  const rel = prefix ? `${prefix}/${e.name}` : e.name;
  out.push(rel);
  await walkDirs(root, `${dir}/${e.name}`, rel, out);
}

async function walkDirs(
  root: string,
  dir: string,
  prefix: string,
  out: string[],
): Promise<void> {
  const full = `${root}/${dir}`.replace(/\/+/g, '/');
  let entries: Deno.DirEntry[];
  try {
    entries = Array.from(await Deno.readDir(full));
  } catch {
    return;
  }
  for (const e of entries) await walkOneDir(root, dir, prefix, out, e);
}

function pushInfixSuffixErrors(
  rel: string,
  layer: string,
  parts: string[],
  errors: string[],
): void {
  if (parts.length >= 2 && !LAYER_INFIX[layer]?.has(parts[1])) {
    errors.push(`${rel}: infix "${parts[1]}" not in ${layer} allowed set`);
  }
  if (parts.length >= 3 && !LAYER_SUFFIX[layer]?.has(parts[2])) {
    errors.push(`${rel}: suffix "${parts[2]}" not in ${layer} allowed set`);
  }
}

function validateOnePath(rel: string, errors: string[]): void {
  const parts = rel.split('/').filter(Boolean);
  if (parts.length === 0) return;
  if (!LAYERS.includes(parts[0] as (typeof LAYERS)[number])) return;
  pushInfixSuffixErrors(rel, parts[0], parts, errors);
}

function collectPathErrors(allDirs: string[]): string[] {
  const errors: string[] = [];
  for (const rel of allDirs) validateOnePath(rel, errors);
  return errors;
}

async function runCheck(): Promise<{ errors: string[] }> {
  const root = Deno.cwd();
  const allDirs: string[] = [];
  await walkDirs(root, '', '', allDirs);
  return { errors: collectPathErrors(allDirs) };
}

async function main(): Promise<void> {
  const { errors } = await runCheck();
  if (errors.length > 0) {
    console.error('Layer naming check failed (store.md §E):');
    for (const e of errors) console.error('  ', e);
    Deno.exit(1);
  }
  console.log(
    'Naming-layer check passed: layer-prefixed paths use allowed infix/suffix.',
  );
}

main();
