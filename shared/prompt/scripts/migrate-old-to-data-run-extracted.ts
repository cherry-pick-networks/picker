/**
 * Extracted (knowledge/content) migration runner.
 */

import { generate as uuidV7 } from "@std/uuid/v7";
import type {
  ExtractedIndex,
  ExtractedIndexEntry,
} from "../../../system/record/data.store.ts";
import {
  deriveExtractedName,
  deriveType,
  isMeaninglessFilename,
  walkFiles,
} from "./migrate-old-to-data-helpers.ts";
import { readAndParse } from "./migrate-old-to-data-parse.ts";

function buildEntry(
  rel: string,
  parsed: unknown,
  type: string,
  now: string,
): ExtractedIndexEntry {
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
  return entry;
}

async function writeFileAndBuildEntry(
  rel: string,
  parsed: unknown,
  extractedDir: string,
  uuid: string,
  raw: string,
  now: string,
): Promise<ExtractedIndexEntry> {
  await Deno.writeTextFile(`${extractedDir}${uuid}.json`, raw);
  return buildEntry(rel, parsed, deriveType(rel), now);
}

async function processOneFile(
  rel: string,
  oldDir: string,
  extractedDir: string,
  extractedIndex: ExtractedIndex,
  now: string,
): Promise<void> {
  const abs = `${oldDir}${rel}`;
  const { raw, parsed } = await readAndParse(abs);
  const uuid = uuidV7();
  extractedIndex[uuid] = await writeFileAndBuildEntry(
    rel,
    parsed,
    extractedDir,
    uuid,
    raw,
    now,
  );
}

async function runOneSub(
  oldDir: string,
  extractedDir: string,
  extractedIndex: ExtractedIndex,
  now: string,
  sub: string,
): Promise<void> {
  const base = `${oldDir}${sub}/`;
  try {
    await Deno.stat(base);
  } catch {
    return;
  }
  const files = await walkFiles(base, `${sub}/`, ".json");
  for (const rel of files) {
    await processOneFile(rel, oldDir, extractedDir, extractedIndex, now);
  }
}

export async function runExtractedMigration(
  oldDir: string,
  extractedDir: string,
  extractedIndex: ExtractedIndex,
  now: string,
): Promise<void> {
  const subs = ["knowledge", "content"];
  for (const sub of subs) {
    await runOneSub(oldDir, extractedDir, extractedIndex, now, sub);
  }
}
