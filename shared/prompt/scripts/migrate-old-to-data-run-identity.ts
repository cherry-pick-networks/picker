/**
 * Identity migration runner.
 */

import { generate as uuidV7 } from "@std/uuid/v7";
import type {
  IdentityIndex,
  IdentityIndexEntry,
} from "../../../system/store/data.ts";
import {
  deriveIdentityName,
  isMeaninglessFilename,
  walkFiles,
} from "./migrate-old-to-data-helpers.ts";

async function readAndParse(abs: string): Promise<{ raw: string; parsed: unknown }> {
  const raw = await Deno.readTextFile(abs);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  return { raw, parsed };
}

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

async function writeFileAndBuildEntry(
  rel: string,
  parsed: unknown,
  identityDir: string,
  uuid: string,
  raw: string,
  now: string,
): Promise<IdentityIndexEntry> {
  await Deno.writeTextFile(`${identityDir}${uuid}.json`, raw);
  return buildEntry(rel, parsed, kindFromRel(rel), now);
}

async function processOneFile(
  rel: string,
  oldDir: string,
  identityDir: string,
  identityIndex: IdentityIndex,
  now: string,
): Promise<void> {
  const abs = `${oldDir}${rel}`;
  const { raw, parsed } = await readAndParse(abs);
  const uuid = uuidV7();
  identityIndex[uuid] = await writeFileAndBuildEntry(
    rel,
    parsed,
    identityDir,
    uuid,
    raw,
    now,
  );
}

export async function runIdentityMigration(
  oldDir: string,
  identityDir: string,
  identityIndex: IdentityIndex,
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
    await processOneFile(rel, oldDir, identityDir, identityIndex, now);
  }
}
