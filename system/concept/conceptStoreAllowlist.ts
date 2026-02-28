/**
 * Allowlist data loading from concept tables. Used by conceptStore.loadAllowlistData.
 */

import type { AllowlistData } from '#shared/contract/allowlistTypes.ts';
import { getPg } from '#shared/infra/pgClient.ts';
import { loadSql } from '#shared/infra/sqlLoader.ts';
import {
  COGNITIVE_LEVEL_SCHEMES,
  CONTENT_TYPE_SCHEMES,
  CONTEXT_SCHEMES,
  SUBJECT_SCHEMES,
} from './conceptSchemes.ts';

const sqlDir = new URL('./sql/', import.meta.url);
const SQL_LIST_CONCEPT_CODES_BY_SCHEME = await loadSql(
  sqlDir,
  'list_concept_codes_by_scheme.sql',
);

async function getAllowlistRows(): Promise<
  { scheme_id: string; code: string }[]
> {
  const pg = await getPg();
  const r = await pg.queryObject<{ scheme_id: string; code: string }>(
    SQL_LIST_CONCEPT_CODES_BY_SCHEME,
  );
  return r.rows;
}

function createSubjectContentTypeSets() {
  const subject = new Set<string>();
  const contentType = new Set<string>();
  return { subject, contentType };
}

function createCognitiveContextSets() {
  const cognitiveLevel = new Set<string>();
  const context = new Set<string>();
  return { cognitiveLevel, context };
}

function mergeAllowlistSets(
  a: ReturnType<typeof createSubjectContentTypeSets>,
  b: ReturnType<typeof createCognitiveContextSets>,
) {
  const out = { ...a, ...b };
  return out;
}

function getSubjectContentTypeSchemeIds() {
  const subjectIds = new Set<string>(SUBJECT_SCHEMES);
  const contentTypeIds = new Set<string>(CONTENT_TYPE_SCHEMES);
  return { subjectIds, contentTypeIds };
}

function getCognitiveContextSchemeIds() {
  const cognitiveIds = new Set<string>(COGNITIVE_LEVEL_SCHEMES);
  const contextIds = new Set<string>(CONTEXT_SCHEMES);
  return { cognitiveIds, contextIds };
}

function getSchemeIdSets() {
  const a = getSubjectContentTypeSchemeIds();
  const b = getCognitiveContextSchemeIds();
  return { ...a, ...b };
}

type AllowlistSets = ReturnType<typeof mergeAllowlistSets>;

function fillSetsFromRows(
  rows: { scheme_id: string; code: string }[],
  sets: AllowlistSets,
  ids: ReturnType<typeof getSchemeIdSets>,
): void {
  for (const row of rows) {
    if (ids.subjectIds.has(row.scheme_id)) sets.subject.add(row.code);
    else if (ids.contentTypeIds.has(row.scheme_id)) {
      sets.contentType.add(row.code);
    } else if (ids.cognitiveIds.has(row.scheme_id)) {
      sets.cognitiveLevel.add(row.code);
    } else if (ids.contextIds.has(row.scheme_id)) sets.context.add(row.code);
  }
  return;
}

function buildAllowlistResult(sets: AllowlistSets): AllowlistData {
  const concept = new Set<string>([
    ...sets.subject,
    ...sets.contentType,
    ...sets.cognitiveLevel,
    ...sets.context,
  ]);
  return { ...sets, concept };
}

export async function loadAllowlistData(): Promise<AllowlistData> {
  const rows = await getAllowlistRows();
  const sets = mergeAllowlistSets(
    createSubjectContentTypeSets(),
    createCognitiveContextSets(),
  );
  fillSetsFromRows(rows, sets, getSchemeIdSets());
  return buildAllowlistResult(sets);
}
