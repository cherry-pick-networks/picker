/**
 * Source extract service: load source → LLM extract → validate → save.
 */

import {
  ALLOWLIST_ID_COUNT_LIMIT,
  allowlistHas,
  type FacetName,
} from '#shared/contract/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#shared/contract/allowlistData.ts';
import type { Source } from '#system/source/sourceSchema.ts';
import { extractConcepts } from '#system/source/sourceLlmClient.ts';
import { getSource } from '#system/source/sourceService.ts';
import * as sourceStore from '#system/source/sourceStore.ts';

export type ExtractOk = {
  ok: true;
  concept_ids: string[];
  subject_id?: string;
  extracted_at: string;
};

export type ExtractFail = {
  ok: false;
  status: 400 | 404 | 502;
  message: string;
};

export type ExtractResult = ExtractOk | ExtractFail;

const BODY_MAX_CHARS = 1_000_000;

function hasBody(source: Source): boolean {
  const s = source.body;
  return typeof s === 'string' && s.length > 0;
}

function bodyTooLong(source: Source): boolean {
  const len = source.body?.length ?? 0;
  return len > BODY_MAX_CHARS;
}

function validateForExtract(source: Source | null): ExtractFail | null {
  if (source == null) {
    return { ok: false, status: 404 as const, message: 'Not found' };
  }
  if (!hasBody(source)) {
    return { ok: false, status: 400 as const, message: 'Source has no body' };
  }
  if (bodyTooLong(source)) {
    return { ok: false, status: 400 as const, message: 'Body too long' };
  }
  return null;
}

async function validateExtractConceptIds(ids: string[]): Promise<void> {
  if (ids.length > ALLOWLIST_ID_COUNT_LIMIT) {
    throw new Error(
      `Too many concept IDs (max ${ALLOWLIST_ID_COUNT_LIMIT})`,
    );
  }
  const data = await getAllowlistDataOrLoad();
  const invalid = ids.filter((id) => !allowlistHas(data, 'concept', id));
  if (invalid.length > 0) {
    throw new Error(`Invalid concept IDs: ${invalid.join(', ')}`);
  }
}

async function validateExtractSubjectId(id: string | undefined): Promise<void> {
  if (id == null || id === '') return;
  const data = await getAllowlistDataOrLoad();
  if (!allowlistHas(data, 'subject', id)) {
    throw new Error(`Invalid subject_id: ${id}`);
  }
}

function persistExtract(
  source: Source,
  concept_ids: string[],
  subject_id: string | undefined,
): Promise<ExtractOk> {
  const extracted_at = new Date().toISOString();
  const updated = {
    ...source,
    extracted_concept_ids: concept_ids,
    extracted_subject_id: subject_id,
    extracted_at,
  };
  return sourceStore
    .setSource(updated as unknown as Record<string, unknown>)
    .then(() => ({
      ok: true as const,
      concept_ids,
      subject_id,
      extracted_at,
    }));
}

async function validateAndPersist(
  source: Source,
  concept_ids: string[],
  subject_id: string | undefined,
): Promise<ExtractOk> {
  await validateExtractConceptIds(concept_ids);
  await validateExtractSubjectId(subject_id);
  return persistExtract(source, concept_ids, subject_id);
}

async function runExtractAndSave(source: Source): Promise<ExtractOk> {
  const llm = await extractConcepts(source.body as string);
  if (!llm.ok) return Promise.reject(new Error(llm.error));
  return validateAndPersist(
    source,
    llm.output.concept_ids,
    llm.output.subject_id,
  );
}

/**
 * Extract concept/subject IDs from source body via LLM and persist to source.
 * Returns result; caller maps ExtractFail to 4xx/5xx.
 */
export async function extractConceptsFromSource(
  sourceId: string,
): Promise<ExtractResult> {
  const source = await getSource(sourceId);
  const fail = validateForExtract(source);
  if (fail != null) return fail;
  try {
    return await runExtractAndSave(source!);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith('Invalid ') ? 400 : 502;
    return { ok: false, status, message: msg };
  }
}
