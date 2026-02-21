/**
 * File-based UUID v7 storage under data/. See shared/prompt/boundary.md.
 */

const DATA_DIR = new URL("../../data/", import.meta.url).pathname;
const EXTRACTED_DIR = `${DATA_DIR}extracted/`;
const IDENTITY_DIR = `${DATA_DIR}identity/`;
const EXTRACTED_INDEX_PATH = `${DATA_DIR}extracted-data-index.json`;
const IDENTITY_INDEX_PATH = `${DATA_DIR}identity-index.json`;

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
  return DATA_DIR;
}

export function getExtractedDir(): string {
  return EXTRACTED_DIR;
}

export function getIdentityDir(): string {
  return IDENTITY_DIR;
}

export function getExtractedIndexPath(): string {
  return EXTRACTED_INDEX_PATH;
}

export function getIdentityIndexPath(): string {
  return IDENTITY_INDEX_PATH;
}

export async function readExtractedIndex(): Promise<ExtractedIndex> {
  try {
    const raw = await Deno.readTextFile(EXTRACTED_INDEX_PATH);
    return JSON.parse(raw) as ExtractedIndex;
  } catch {
    return {};
  }
}

export async function readIdentityIndex(): Promise<IdentityIndex> {
  try {
    const raw = await Deno.readTextFile(IDENTITY_INDEX_PATH);
    return JSON.parse(raw) as IdentityIndex;
  } catch {
    return {};
  }
}

export async function readExtractedFile(id: string): Promise<unknown | null> {
  const path = `${EXTRACTED_DIR}${id}.json`;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function readIdentityFile(id: string): Promise<unknown | null> {
  const path = `${IDENTITY_DIR}${id}.json`;
  try {
    const raw = await Deno.readTextFile(path);
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
