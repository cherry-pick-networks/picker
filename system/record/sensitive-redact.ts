/**
 * Redact PII and copyright for external responses. Agent requests
 * bypass and get full data from endpoints.
 */

import type {
  IdentityIndex,
  IdentityStudentEntry,
} from "./identity-index.store.ts";
import type { Source } from "#system/source/source.schema.ts";

/** External view: no name, school, diagnosis_file. */
export interface RedactedIdentityEntry {
  id: string;
  class?: string;
}

/** External view of identity index. */
export interface RedactedIdentityIndex {
  version?: number;
  description?: string;
  students?: RedactedIdentityEntry[];
}

const SENSITIVE_KEYS = new Set([
  "copyright",
  "author",
  "license",
  "publisher",
  "rights",
]);

export function redactIdentityEntry(
  entry: IdentityStudentEntry,
): RedactedIdentityEntry {
  const out: RedactedIdentityEntry = { id: entry.id };
  if (entry.class != null) out.class = entry.class;
  return out;
}

export function redactIdentityIndex(
  index: IdentityIndex,
): RedactedIdentityIndex {
  const students = index.students?.map(redactIdentityEntry);
  return {
    ...(index.version != null && { version: index.version }),
    description: index.description,
    ...(students != null && { students }),
  };
}

function stripSensitiveMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const out = { ...meta };
  for (const k of Object.keys(out)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) delete out[k];
  }
  return out;
}

/** Strip copyright-related keys from source metadata for external. */
export function redactSource(source: Source): Source {
  const meta = source.metadata;
  if (meta == null) return source;
  const cleaned = stripSensitiveMetadata(meta);
  return { ...source, metadata: Object.keys(cleaned).length ? cleaned : undefined };
}
