/** File-based UUID v7 storage under shared/record/ (store/, reference/). */

const DATA_DIR = new URL("../../../shared/record/", import.meta.url).pathname;
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

const readOne = (path: string): Promise<string | null> =>
  Deno.readTextFile(path).then((s) => s).catch(() => null);

async function readTextOrNull(path: string): Promise<string | null> {
  const raw = await readOne(path);
  return raw;
}

export async function readExtractedIndex(): Promise<ExtractedIndex> {
  const raw = await readTextOrNull(EXTRACTED_INDEX_PATH);
  return raw !== null ? (JSON.parse(raw) as ExtractedIndex) : {};
}

export async function readIdentityIndex(): Promise<IdentityIndex> {
  const raw = await readTextOrNull(IDENTITY_INDEX_PATH);
  return raw !== null ? (JSON.parse(raw) as IdentityIndex) : {};
}

const recordPath = (id: string): string => `${RECORD_STORE}${id}.json`;

export async function readExtractedFile(id: string): Promise<unknown | null> {
  const raw = await readTextOrNull(recordPath(id));
  return raw !== null ? (JSON.parse(raw) as unknown) : null;
}

export async function readIdentityFile(id: string): Promise<unknown | null> {
  const raw = await readTextOrNull(recordPath(id));
  return raw !== null ? (JSON.parse(raw) as unknown) : null;
}
