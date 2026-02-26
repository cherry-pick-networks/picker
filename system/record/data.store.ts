/**
 * File-based identity data under shared/record/reference/
 * (identity-index only).
 */

import { readTomlFile } from "./toml.service.ts";

const DATA_DIR = new URL("../../../shared/record/", import.meta.url).pathname;
const IDENTITY_INDEX_PATH = `${DATA_DIR}reference/identity-index.toml`;

/** One student row in identity-index.toml [[students]]. */
export interface IdentityStudentEntry {
  id: string;
  name?: string;
  school?: string;
  grade?: string;
  class?: string;
  diagnosis_file?: string;
}

/** Shape of identity-index.toml (version, description, [[students]]). */
export interface IdentityIndex {
  version?: number;
  description?: string;
  students?: IdentityStudentEntry[];
}

/** Legacy index entry for migration script only (Record<uuid, entry>). */
export interface IdentityIndexEntry {
  kind: string;
  name?: string;
  oldPath?: string;
  createdAt?: string;
}

/** Legacy index type for migration script only. */
export type LegacyIdentityIndex = Record<string, IdentityIndexEntry>;

export function getDataDir(): string {
  const out = DATA_DIR;
  return out;
}

export function getIdentityIndexPath(): string {
  const out = IDENTITY_INDEX_PATH;
  return out;
}

export async function readIdentityIndex(): Promise<IdentityIndex> {
  const data = await readTomlFile<IdentityIndex>(IDENTITY_INDEX_PATH);
  return data ?? {};
}

/** Find student by id in identity index (no store files). */
export async function getIdentityById(
  id: string,
): Promise<IdentityStudentEntry | null> {
  const index = await readIdentityIndex();
  const student = index.students?.find((s) => s.id === id);
  return student ?? null;
}
