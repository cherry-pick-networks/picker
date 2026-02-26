/**
 * Source extract service: load source → LLM extract → save extracted_*.
 */

import type { Source } from "#system/source/source.schema.ts";
import { extractConcepts } from "#system/source/source-llm.client.ts";
import { getSource } from "#system/source/source.service.ts";
import * as sourceStore from "#system/source/source.store.ts";

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
  return typeof s === "string" && s.length > 0;
}

function bodyTooLong(source: Source): boolean {
  const len = source.body?.length ?? 0;
  return len > BODY_MAX_CHARS;
}

function validateForExtract(source: Source | null): ExtractFail | null {
  if (source == null) {
    return { ok: false, status: 404 as const, message: "Not found" };
  }
  if (!hasBody(source)) {
    return { ok: false, status: 400 as const, message: "Source has no body" };
  }
  if (bodyTooLong(source)) {
    return { ok: false, status: 400 as const, message: "Body too long" };
  }
  return null;
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

async function runExtractAndSave(source: Source): Promise<ExtractOk> {
  const llm = await extractConcepts(source.body as string);
  if (!llm.ok) return Promise.reject(new Error(llm.error));
  return persistExtract(
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
    return { ok: false, status: 502, message: msg };
  }
}
