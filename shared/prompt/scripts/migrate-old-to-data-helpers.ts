/**
 * Helpers for migrate-old-to-data: paths, naming, walk.
 */
export async function ensureDir(path: string): Promise<void> {
  const opts = { recursive: true };
  await Deno.mkdir(path, opts);
}

const TYPE_PREFIXES: [string, string][] = [
  ["knowledge/curriculum/", "curriculum"],
  ["knowledge/books/", "books"],
  ["knowledge/plans/", "plans"],
  ["knowledge/", "knowledge"],
  ["content/", "content"],
  ["scout/", "scout"],
];

export function deriveType(relPath: string): string {
  for (const [prefix, type] of TYPE_PREFIXES) {
    if (relPath.startsWith(prefix)) return type;
  }
  return "extracted";
}

/** True when basename is only digits + .json (e.g. 1.json, 12.json). */
export function isMeaninglessFilename(basename: string): boolean {
  const ok = /^\d+\.json$/i.test(basename);
  return ok;
}

function toRecord(obj: unknown): Record<string, unknown> | null {
  const ok = obj && typeof obj === "object";
  return ok ? (obj as Record<string, unknown>) : null;
}

function gradeName(
  type: string,
  obj: Record<string, unknown>,
): string | undefined {
  const g = obj.grade;
  if (typeof g !== "number") return undefined;
  if (type === "plans") return `plan-grade-${g}`;
  return type === "curriculum" ? `curriculum-grade-${g}` : undefined;
}

function firstStringKey(
  obj: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

function baseFromPath(relPath: string): string | undefined {
  const base = relPath.replace(/\.json$/i, "").split("/").pop() ?? "";
  return base && !/^\d+$/.test(base) ? base : undefined;
}

export function deriveExtractedName(
  relPath: string,
  parsed: unknown,
  type: string,
): string | undefined {
  const obj = toRecord(parsed);
  if (!obj) return undefined;
  return (
    gradeName(type, obj) ??
    firstStringKey(obj, ["title", "name", "id"]) ??
    baseFromPath(relPath)
  );
}

export function deriveIdentityName(
  relPath: string,
  parsed: unknown,
  kind: string,
): string | undefined {
  const basename = relPath.split("/").pop() ?? "";
  if (!isMeaninglessFilename(basename)) return undefined;
  const obj = toRecord(parsed);
  return obj ? (firstStringKey(obj, ["name", "title", "id"]) ?? kind) : kind;
}

async function walkOne(
  dir: string,
  prefix: string,
  ext: ".json",
  e: Deno.DirEntry,
): Promise<string[]> {
  const rel = `${prefix}${e.name}`;
  if (e.isFile && rel.toLowerCase().endsWith(".json")) return [rel];
  if (!e.isDirectory) return [];
  return await walkFiles(`${dir}${e.name}/`, `${rel}/`, ext);
}

export async function walkFiles(
  dir: string,
  prefix: string,
  ext: ".json",
): Promise<string[]> {
  const out: string[] = [];
  for await (const e of Deno.readDir(dir)) {
    const part = await walkOne(dir, prefix, ext, e);
    out.push(...part);
  }
  return out;
}
