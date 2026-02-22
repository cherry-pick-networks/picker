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

// deno-lint-ignore function-length/function-length
export function getDataDir(): string {
  return DATA_DIR;
}

// deno-lint-ignore function-length/function-length
export function getExtractedDir(): string {
  return RECORD_STORE;
}

// deno-lint-ignore function-length/function-length
export function getIdentityDir(): string {
  return RECORD_STORE;
}

// deno-lint-ignore function-length/function-length
export function getExtractedIndexPath(): string {
  return EXTRACTED_INDEX_PATH;
}

// deno-lint-ignore function-length/function-length
export function getIdentityIndexPath(): string {
  return IDENTITY_INDEX_PATH;
}

// deno-lint-ignore function-length/function-length
export async function readExtractedIndex(): Promise<ExtractedIndex> {
  try {
    const raw = await Deno.readTextFile(EXTRACTED_INDEX_PATH);
    return JSON.parse(raw) as ExtractedIndex;
  } catch {
    return {};
  }
}

// deno-lint-ignore function-length/function-length
export async function readIdentityIndex(): Promise<IdentityIndex> {
  try {
    const raw = await Deno.readTextFile(IDENTITY_INDEX_PATH);
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
