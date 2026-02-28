/**
 * One-off import: lexis-high-basic 1200 headwords into lexis_entry.
 * Requires: source "lexis-high-basic" exists (run seed:lexis first), DB env.
 *
 * Usage:
 *   deno run -A scripts/import-lexis-high-basic.ts
 *     Reads headwords from temp/lexis/lexis-high-basic-headwords.json
 *     (JSON array of 1200 strings).
 *   deno run -A scripts/import-lexis-high-basic.ts --write-headwords
 *     Copies scripts/data/lexis-high-basic-headwords.json to temp/, then
 *     imports.
 */

import { getPg } from "../shared/infra/pgClient.ts";
import { loadSql } from "../shared/infra/sqlLoader.ts";

const lexisSqlDir = new URL("../system/lexis/sql/", import.meta.url);
const SQL_UPSERT_LEXIS_ENTRY = await loadSql(
  lexisSqlDir,
  "upsert_lexis_entry.sql",
);

const SOURCE_ID = "lexis-high-basic";
const WORDS_PER_DAY = 40;
const DEFAULT_HEADWORDS_PATH = "temp/lexis/lexis-high-basic-headwords.json";
const DATA_HEADWORDS_PATH = "scripts/data/lexis-high-basic-headwords.json";

function dayIndex(entryIndex: number): number {
  const d = Math.ceil(entryIndex / WORDS_PER_DAY);
  return d;
}

function reportMissingHeadwords(): void {
  console.error("Missing or invalid headwords file:", DEFAULT_HEADWORDS_PATH);
  console.error(
    "Run with --write-headwords to copy from " + DATA_HEADWORDS_PATH + ".",
  );
}

async function loadDataHeadwords(): Promise<string[]> {
  const raw = await Deno.readTextFile(DATA_HEADWORDS_PATH);
  return JSON.parse(raw) as string[];
}

async function writeJsonToTemp(path: string, data: string[]): Promise<void> {
  await Deno.mkdir("temp/lexis", { recursive: true });
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
  console.log("Wrote", path);
}

async function writeHeadwordsFile(): Promise<string[]> {
  const headwords = await loadDataHeadwords();
  await writeJsonToTemp(DEFAULT_HEADWORDS_PATH, headwords);
  return headwords;
}

async function readHeadwordsFile(): Promise<string[]> {
  try {
    const raw = await Deno.readTextFile(DEFAULT_HEADWORDS_PATH);
    return JSON.parse(raw) as string[];
  } catch (e) {
    reportMissingHeadwords();
    throw e;
  }
}

async function loadHeadwords(): Promise<string[]> {
  const write = Deno.args.includes("--write-headwords");
  const headwords = write
    ? await writeHeadwordsFile()
    : await readHeadwordsFile();
  if (headwords.length !== 1200) {
    const msg = `Expected 1200 headwords, got ${headwords.length}. Check ` +
      DEFAULT_HEADWORDS_PATH + ".";
    throw new Error(msg);
  }
  return headwords;
}

async function importHeadwordsToPg(
  pg: Awaited<ReturnType<typeof getPg>>,
  headwords: string[],
): Promise<void> {
  for (let i = 0; i < headwords.length; i++) {
    const entryIndex = i + 1;
    const day = dayIndex(entryIndex);
    const headword = headwords[i].trim();
    await pg.queryArray(SQL_UPSERT_LEXIS_ENTRY, [
      SOURCE_ID,
      entryIndex,
      day,
      headword,
    ]);
  }
  console.log("Imported", headwords.length, "entries for", SOURCE_ID);
}

async function main(): Promise<void> {
  const headwords = await loadHeadwords();
  const pg = await getPg();
  await importHeadwordsToPg(pg, headwords);
  await pg.end();
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
