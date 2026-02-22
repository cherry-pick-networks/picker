/**
 * One-off: migrate shared/record and system/audit JSON files to TOML.
 * Run once; then remove this script or keep for reference.
 */
// function-length-ignore-file

import { stringify } from "@std/toml/stringify";

const ROOT = new URL("../../../", import.meta.url).pathname;
const REF_DIR = `${ROOT}shared/record/reference/`;
const STORE_DIR = `${ROOT}shared/record/store/`;
const AUDIT_DIR = `${ROOT}system/audit/`;
const E2E_RUNS_PATH = `${AUDIT_DIR}e2e-runs.toml`;

async function readJson(path: string): Promise<Record<string, unknown> | null> {
  const raw = await Deno.readTextFile(path).catch(() => null);
  if (raw === null) return null;
  return JSON.parse(raw) as Record<string, unknown>;
}

async function writeToml(
  path: string,
  obj: Record<string, unknown>,
): Promise<void> {
  await Deno.writeTextFile(path, stringify(obj));
}

async function migrateExtractedIndex(): Promise<void> {
  const jsonPath = `${REF_DIR}extracted-data-index.json`;
  const obj = await readJson(jsonPath);
  if (obj === null) return;
  const tomlPath = `${REF_DIR}extracted-data-index.toml`;
  await writeToml(tomlPath, obj);
  await Deno.remove(jsonPath);
  console.log("Migrated extracted-data-index.json -> .toml");
}

async function migrateIdentityIndex(): Promise<void> {
  const jsonPath = `${REF_DIR}identity-index.json`;
  const obj = await readJson(jsonPath);
  if (obj === null) return;
  const tomlPath = `${REF_DIR}identity-index.toml`;
  await writeToml(tomlPath, obj);
  await Deno.remove(jsonPath);
  console.log("Migrated identity-index.json -> .toml");
}

async function migrateStoreFiles(): Promise<void> {
  let count = 0;
  for await (const e of Deno.readDir(STORE_DIR)) {
    if (!e.isFile || !e.name.endsWith(".json")) continue;
    const jsonPath = `${STORE_DIR}${e.name}`;
    const obj = await readJson(jsonPath);
    if (obj === null) continue;
    const base = e.name.replace(/\.json$/i, "");
    const tomlPath = `${STORE_DIR}${base}.toml`;
    await writeToml(tomlPath, obj);
    await Deno.remove(jsonPath);
    count++;
  }
  if (count > 0) console.log(`Migrated ${count} store/*.json -> .toml`);
}

async function migrateE2eRuns(): Promise<void> {
  const jsonPath = `${AUDIT_DIR}e2e-runs.json`;
  const obj = await readJson(jsonPath);
  if (obj === null) return;
  await writeToml(E2E_RUNS_PATH, obj);
  await Deno.remove(jsonPath);
  console.log("Migrated e2e-runs.json -> .toml");
}

async function main(): Promise<void> {
  await migrateExtractedIndex();
  await migrateIdentityIndex();
  await migrateStoreFiles();
  await migrateE2eRuns();
  console.log("Done.");
}

main();
