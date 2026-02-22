/**
 * Migration runners: extracted (knowledge/content) and identity.
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
  deriveExtractedName,
  deriveIdentityName,
  deriveType,
  isMeaninglessFilename,
  walkFiles,
} from "./migrate-old-to-data-helpers.ts";

export async function runExtractedMigration(
  oldDir: string,
  extractedDir: string,
  extractedIndex: ExtractedIndex,
  now: string,
): Promise<void> {
  for (const sub of ["knowledge", "content"]) {
    const base = `${oldDir}${sub}/`;
    try {
      await Deno.stat(base);
    } catch {
      continue;
    }
    const files = await walkFiles(base, `${sub}/`, ".json");
    for (const rel of files) {
      const abs = `${oldDir}${rel}`;
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
}

export async function runIdentityMigration(
  oldDir: string,
  identityDir: string,
  identityIndex: IdentityIndex,
  now: string,
): Promise<void> {
  const identityBase = `${oldDir}identity/`;
  let identityFiles: string[] = [];
  try {
    await Deno.stat(identityBase);
    identityFiles = await walkFiles(identityBase, "identity/", ".json");
  } catch {
    // skip if no identity dir
  }
  for (const rel of identityFiles) {
    const abs = `${oldDir}${rel}`;
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
    const kind = rel.endsWith("student-profile.json")
      ? "student-profile"
      : "identity";
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
}
