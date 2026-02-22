/**
 * Migrate .old (knowledge, identity) to shared/record/ with UUID v7 filenames
 * and index JSONs. Usage: deno run -A shared/prompt/scripts/migrate-old-to-data.ts
 */
// deno-lint-ignore-file function-length/function-length

import { generate as uuidV7 } from "@std/uuid/v7";
import type {
  ExtractedIndex,
  ExtractedIndexEntry,
  IdentityIndex,
  IdentityIndexEntry,
} from "../../../system/store/data.ts";
import {
  getExtractedDir,
  getIdentityDir,
  getExtractedIndexPath,
  getIdentityIndexPath,
  readExtractedIndex,
  readIdentityIndex,
} from "../../../system/store/data.ts";

const PROJECT_ROOT = new URL("../../../", import.meta.url).pathname;
const OLD_DIR = `${PROJECT_ROOT}.old/`;

async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

function deriveType(relPath: string): string {
  if (relPath.startsWith("knowledge/curriculum/")) return "curriculum";
  if (relPath.startsWith("knowledge/books/")) return "books";
  if (relPath.startsWith("knowledge/plans/")) return "plans";
  if (relPath.startsWith("knowledge/")) return "knowledge";
  if (relPath.startsWith("content/")) return "content";
  if (relPath.startsWith("scout/")) return "scout";
  return "extracted";
}

/** True when basename is only digits + .json (e.g. 1.json, 12.json). */
function isMeaninglessFilename(basename: string): boolean {
  return /^\d+\.json$/i.test(basename);
}

function deriveExtractedName(
  relPath: string,
  parsed: unknown,
  type: string,
): string | undefined {
  const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
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

function deriveIdentityName(relPath: string, parsed: unknown, kind: string): string | undefined {
  if (!isMeaninglessFilename(relPath.split("/").pop() ?? "")) return undefined;
  const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  if (!obj) return kind;
  for (const key of ["name", "title", "id"]) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return kind;
}

async function walkFiles(dir: string, prefix: string, ext: ".json"): Promise<string[]> {
  const out: string[] = [];
  for await (const e of Deno.readDir(dir)) {
    const rel = `${prefix}${e.name}`;
    if (e.isFile && (ext === ".json" ? rel.toLowerCase().endsWith(".json") : true)) out.push(rel);
    else if (e.isDirectory) {
      const sub = await walkFiles(`${dir}${e.name}/`, `${rel}/`, ext);
      out.push(...sub);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const extractedDir = getExtractedDir();
  const identityDir = getIdentityDir();
  await ensureDir(extractedDir);
  await ensureDir(identityDir);
  const extractedRefDir = getExtractedIndexPath().replace(/\/[^/]+$/, "/");
  const identityRefDir = getIdentityIndexPath().replace(/\/[^/]+$/, "/");
  await ensureDir(extractedRefDir);
  await ensureDir(identityRefDir);

  let extractedIndex: ExtractedIndex = {};
  try {
    extractedIndex = await readExtractedIndex();
  } catch {
    // keep {}
  }
  let identityIndex: IdentityIndex = {};
  try {
    identityIndex = await readIdentityIndex();
  } catch {
    // keep {}
  }

  const now = new Date().toISOString();

  // .old/knowledge/** and .old/content/** -> extracted (.json only)
  for (const sub of ["knowledge", "content"]) {
    const base = `${OLD_DIR}${sub}/`;
    try {
      await Deno.stat(base);
    } catch {
      continue;
    }
    const files = await walkFiles(base, `${sub}/`, ".json");
    for (const rel of files) {
      const abs = `${OLD_DIR}${rel}`;
      const raw = await Deno.readTextFile(abs);
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      const uuid = uuidV7();
      const outPath = `${extractedDir}${uuid}.json`;
      await Deno.writeTextFile(outPath, raw);
      const type = deriveType(rel);
      const basename = rel.split("/").pop() ?? "";
      const entry: ExtractedIndexEntry = {
        type,
        source: rel,
        oldPath: rel,
        createdAt: now,
      };
      if (isMeaninglessFilename(basename)) {
        const name = deriveExtractedName(rel, parsed, type);
        if (name) entry.name = name;
      }
      extractedIndex[uuid] = entry;
    }
  }

  // .old/identity/** -> identity (.json only)
  const identityBase = `${OLD_DIR}identity/`;
  let identityFiles: string[] = [];
  try {
    await Deno.stat(identityBase);
    identityFiles = await walkFiles(identityBase, "identity/", ".json");
  } catch {
    // skip if no identity dir
  }
  for (const rel of identityFiles) {
    const abs = `${OLD_DIR}${rel}`;
    const raw = await Deno.readTextFile(abs);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    const uuid = uuidV7();
    const outPath = `${identityDir}${uuid}.json`;
    await Deno.writeTextFile(outPath, raw);
    const kind = rel.endsWith("student-profile.json") ? "student-profile" : "identity";
    const entry: IdentityIndexEntry = {
      kind,
      oldPath: rel,
      createdAt: now,
    };
    const basename = rel.split("/").pop() ?? "";
    if (isMeaninglessFilename(basename)) {
      const name = deriveIdentityName(rel, parsed, kind);
      if (name) entry.name = name;
    }
    identityIndex[uuid] = entry;
  }

  await Deno.writeTextFile(
    getExtractedIndexPath(),
    JSON.stringify(extractedIndex, null, 2),
  );
  await Deno.writeTextFile(
    getIdentityIndexPath(),
    JSON.stringify(identityIndex, null, 2),
  );

  console.log("Migration done.");
  console.log("Extracted entries:", Object.keys(extractedIndex).length);
  console.log("Identity entries:", Object.keys(identityIndex).length);
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
