/**
 * Migrate .old (knowledge, identity) to data/ with UUID v7 filenames and
 * index JSONs. Usage: deno run -A shared/prompt/scripts/migrate-old-to-data.ts
 */

import { generate as uuidV7 } from "@std/uuid/v7";
import type { ExtractedIndex, IdentityIndex } from "../../../system/store/data.ts";
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

async function walkFiles(dir: string, prefix: string): Promise<string[]> {
  const out: string[] = [];
  for await (const e of Deno.readDir(dir)) {
    const rel = `${prefix}${e.name}`;
    if (e.isFile) out.push(rel);
    else if (e.isDirectory) {
      const sub = await walkFiles(`${dir}${e.name}/`, `${rel}/`);
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

  // .old/knowledge/** and .old/content/** -> extracted
  for (const sub of ["knowledge", "content"]) {
    const base = `${OLD_DIR}${sub}/`;
    try {
      await Deno.stat(base);
    } catch {
      continue;
    }
    const files = await walkFiles(base, `${sub}/`);
    for (const rel of files) {
      const abs = `${OLD_DIR}${rel}`;
      const raw = await Deno.readTextFile(abs);
      const uuid = uuidV7();
      const outPath = `${extractedDir}${uuid}.json`;
      await Deno.writeTextFile(outPath, raw);
      extractedIndex[uuid] = {
        type: deriveType(rel),
        source: rel,
        oldPath: rel,
        createdAt: now,
      };
    }
  }

  // .old/identity/** -> identity
  const identityBase = `${OLD_DIR}identity/`;
  let identityFiles: string[] = [];
  try {
    await Deno.stat(identityBase);
    identityFiles = await walkFiles(identityBase, "identity/");
  } catch {
    // skip if no identity dir
  }
  for (const rel of identityFiles) {
    const abs = `${OLD_DIR}${rel}`;
    const raw = await Deno.readTextFile(abs);
    const uuid = uuidV7();
    const outPath = `${identityDir}${uuid}.json`;
    await Deno.writeTextFile(outPath, raw);
    identityIndex[uuid] = {
      kind: rel.endsWith("student-profile.json") ? "student-profile" : "identity",
      oldPath: rel,
      createdAt: now,
    };
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
