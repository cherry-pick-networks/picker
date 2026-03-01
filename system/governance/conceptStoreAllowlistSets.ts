//
// Allowlist set creation and filling from DB rows. Used by conceptStoreAllowlist.
//

import type { AllowlistData } from '#system/governance/allowlistTypes.ts';
import {
  COGNITIVE_LEVEL_SCHEMES,
  CONTENT_TYPE_SCHEMES,
  CONTEXT_SCHEMES,
  SUBJECT_SCHEMES,
} from './conceptSchemes.ts';

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
  const contentTypeIds = new Set<string>(
    CONTENT_TYPE_SCHEMES,
  );
  return { subjectIds, contentTypeIds };
}

function getCognitiveContextSchemeIds() {
  const cognitiveIds = new Set<string>(
    COGNITIVE_LEVEL_SCHEMES,
  );
  const contextIds = new Set<string>(CONTEXT_SCHEMES);
  return { cognitiveIds, contextIds };
}

function getSchemeIdSets() {
  const a = getSubjectContentTypeSchemeIds();
  const b = getCognitiveContextSchemeIds();
  return { ...a, ...b };
}

export type AllowlistSets = ReturnType<
  typeof mergeAllowlistSets
>;

export function fillSetsFromRows(
  rows: { scheme_id: string; code: string }[],
  sets: AllowlistSets,
  ids: ReturnType<typeof getSchemeIdSets>,
): void {
  for (const row of rows) {
    if (ids.subjectIds.has(row.scheme_id)) {
      sets.subject.add(row.code);
    } else if (ids.contentTypeIds.has(row.scheme_id)) {
      sets.contentType.add(row.code);
    } else if (ids.cognitiveIds.has(row.scheme_id)) {
      sets.cognitiveLevel.add(row.code);
    } else if (ids.contextIds.has(row.scheme_id)) {
      sets.context.add(row.code);
    }
  }
  return;
}

export function buildAllowlistResult(
  sets: AllowlistSets,
): AllowlistData {
  const concept = new Set<string>([
    ...sets.subject,
    ...sets.contentType,
    ...sets.cognitiveLevel,
    ...sets.context,
  ]);
  return { ...sets, concept };
}

export function createEmptyAllowlistSets(): AllowlistSets {
  return mergeAllowlistSets(
    createSubjectContentTypeSets(),
    createCognitiveContextSets(),
  );
}

export { getSchemeIdSets };
