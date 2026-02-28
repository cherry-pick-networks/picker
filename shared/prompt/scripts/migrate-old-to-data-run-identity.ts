/**
 * Identity migration runner (legacy .old/identity -> index only; no store).
 */

import { generate as uuidV7 } from "@std/uuid/v7";
import type {
  IdentityIndexEntry,
  LegacyIdentityIndex,
} from "#system/record/identityIndexStore.ts";
import {
  deriveIdentityName,
  isMeaninglessFilename,
  walkFiles,
} from "./migrate-old-to-data-helpers.ts";
import { readAndParse } from "./migrate-old-to-data-parse.ts";

function buildEntry(
  rel: string,
  parsed: unknown,
  kind: string,
  now: string,
): IdentityIndexEntry {
  const basename = rel.split("/").pop() ?? "";
  const entry: IdentityIndexEntry = { kind, oldPath: rel, createdAt: now };
  if (isMeaninglessFilename(basename)) {
    const name = deriveIdentityName(rel, parsed, kind);
    if (name) entry.name = name;
  }
  return entry;
}

function kindFromRel(rel: string): "student-profile" | "identity" {
  const isStudent = rel.endsWith("student-profile.json");
  return isStudent ? "student-profile" : "identity";
}

async function processOneFile(
  rel: string,
  oldDir: string,
  identityIndex: LegacyIdentityIndex,
  now: string,
): Promise<void> {
  const abs = `${oldDir}${rel}`;
  const { parsed } = await readAndParse(abs);
  const uuid = uuidV7();
  identityIndex[uuid] = buildEntry(rel, parsed, kindFromRel(rel), now);
}

export async function runIdentityMigration(
  oldDir: string,
  identityIndex: LegacyIdentityIndex,
  now: string,
): Promise<void> {
  let identityFiles: string[] = [];
  try {
    await Deno.stat(`${oldDir}identity/`);
    identityFiles = await walkFiles(`${oldDir}identity/`, "identity/", ".json");
  } catch {
    // skip if no identity dir
  }
  for (const rel of identityFiles) {
    await processOneFile(rel, oldDir, identityIndex, now);
  }
}
