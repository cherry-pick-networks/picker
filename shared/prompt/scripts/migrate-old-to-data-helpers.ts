/**
 * Helpers for migrate-old-to-data: paths, naming, walk.
 */
// deno-lint-ignore-file function-length/function-length

export async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

export function deriveType(relPath: string): string {
  if (relPath.startsWith("knowledge/curriculum/")) return "curriculum";
  if (relPath.startsWith("knowledge/books/")) return "books";
  if (relPath.startsWith("knowledge/plans/")) return "plans";
  if (relPath.startsWith("knowledge/")) return "knowledge";
  if (relPath.startsWith("content/")) return "content";
  if (relPath.startsWith("scout/")) return "scout";
  return "extracted";
}

/** True when basename is only digits + .json (e.g. 1.json, 12.json). */
export function isMeaninglessFilename(basename: string): boolean {
  return /^\d+\.json$/i.test(basename);
}

function toRecord(obj: unknown): Record<string, unknown> | null {
  const ok = obj && typeof obj === "object";
  return ok ? (obj as Record<string, unknown>) : null;
}

export function deriveExtractedName(
  relPath: string,
  parsed: unknown,
  type: string,
): string | undefined {
  const obj = toRecord(parsed);
  if (!obj) return undefined;
  if (type === "plans" && typeof obj.grade === "number") {
    return `plan-grade-${obj.grade}`;
  }
  if (type === "curriculum" && typeof obj.grade === "number") {
    return `curriculum-grade-${obj.grade}`;
  }
  for (const key of ["title", "name", "id"]) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  const base = relPath.replace(/\.json$/i, "").split("/").pop() ?? "";
  if (base && !/^\d+$/.test(base)) return base;
  return undefined;
}

export function deriveIdentityName(
  relPath: string,
  parsed: unknown,
  kind: string,
): string | undefined {
  if (!isMeaninglessFilename(relPath.split("/").pop() ?? "")) return undefined;
  const obj = toRecord(parsed);
  if (!obj) return kind;
  for (const key of ["name", "title", "id"]) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return kind;
}

export async function walkFiles(
  dir: string,
  prefix: string,
  ext: ".json",
): Promise<string[]> {
  const out: string[] = [];
  for await (const e of Deno.readDir(dir)) {
    const rel = `${prefix}${e.name}`;
    const ok = ext === ".json" ? rel.toLowerCase().endsWith(".json") : true;
    if (e.isFile && ok) out.push(rel);
    else if (e.isDirectory) {
      const sub = await walkFiles(`${dir}${e.name}/`, `${rel}/`, ext);
      out.push(...sub);
    }
  }
  return out;
}
