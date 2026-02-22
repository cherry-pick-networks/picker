/**
 * Migrate .old (knowledge, identity) to shared/record/ with UUID v7.
 * Usage: deno run -A shared/prompt/scripts/migrate-old-to-data.ts
 */
// function-length-ignore-file

import type {
  ExtractedIndex,
  IdentityIndex,
} from "../../../system/store/data.ts";
import {
  getExtractedDir,
  getExtractedIndexPath,
  getIdentityDir,
  getIdentityIndexPath,
  readExtractedIndex,
  readIdentityIndex,
} from "../../../system/store/data.ts";
import { ensureDir } from "./migrate-old-to-data-helpers.ts";
import {
  runExtractedMigration,
  runIdentityMigration,
} from "./migrate-old-to-data-run.ts";

const PROJECT_ROOT = new URL("../../../", import.meta.url).pathname;
const OLD_DIR = `${PROJECT_ROOT}.old/`;

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
  await runExtractedMigration(
    OLD_DIR,
    extractedDir,
    extractedIndex,
    now,
  );
  await runIdentityMigration(OLD_DIR, identityDir, identityIndex, now);

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
