/**
 * File-based UUID v7 storage under shared/record/. See boundary.md.
 */

const DATA_DIR = new URL("../../shared/record/", import.meta.url).pathname;
const RECORD_STORE = `${DATA_DIR}store/`;
const EXTRACTED_INDEX_PATH = `${DATA_DIR}reference/extracted-data-index.json`;
const IDENTITY_INDEX_PATH = `${DATA_DIR}reference/identity-index.json`;

export interface ExtractedIndexEntry {
  type: string;
  name?: string;
  source?: string;
  oldPath?: string;
  createdAt?: string;
}

export interface IdentityIndexEntry {
  kind: string;
  name?: string;
  oldPath?: string;
  createdAt?: string;
}

export type ExtractedIndex = Record<string, ExtractedIndexEntry>;
export type IdentityIndex = Record<string, IdentityIndexEntry>;

export function getDataDir(): string {
  const out = DATA_DIR;
  return out;
}

export function getExtractedDir(): string {
  const out = RECORD_STORE;
  return out;
}

export function getIdentityDir(): string {
  const out = RECORD_STORE;
  return out;
}

export function getExtractedIndexPath(): string {
  const out = EXTRACTED_INDEX_PATH;
  return out;
}

export function getIdentityIndexPath(): string {
  const out = IDENTITY_INDEX_PATH;
  return out;
}

export async function readExtractedIndex(): Promise<ExtractedIndex> {
  const path = EXTRACTED_INDEX_PATH;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as ExtractedIndex;
  } catch {
    return {};
  }
}

export async function readIdentityIndex(): Promise<IdentityIndex> {
  const path = IDENTITY_INDEX_PATH;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as IdentityIndex;
  } catch {
    return {};
  }
}

export async function readExtractedFile(id: string): Promise<unknown | null> {
  const path = `${RECORD_STORE}${id}.json`;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function readIdentityFile(id: string): Promise<unknown | null> {
  const path = `${RECORD_STORE}${id}.json`;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
