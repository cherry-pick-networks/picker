/** Concept storage (Postgres): scheme and concept tables. */

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
const SQL_CHECK_IDS_IN_SCHEME = await loadSql(
  sqlDir,
  'check_ids_in_scheme.sql',
);
const SQL_GET_EXISTING_CONCEPT_IDS = await loadSql(
  sqlDir,
  'get_existing_concept_ids_by_schemes.sql',
);
const SQL_LIST_CONCEPT_CODES_BY_SCHEME = await loadSql(
  sqlDir,
  'list_concept_codes_by_scheme.sql',
);

export async function checkIdsInScheme(
  ids: string[],
  schemeId: string,
): Promise<boolean> {
  if (ids.length === 0) return true;
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_CHECK_IDS_IN_SCHEME,
    [schemeId, ids],
  );
  return ids.every((id) => r.rows.some((row) => row.code === id));
}

export async function getExistingConceptIdsBySchemes(
  ids: string[],
  allowedSchemeIds: string[],
): Promise<Set<string>> {
  if (ids.length === 0 || allowedSchemeIds.length === 0) return new Set();
  const pg = await getPg();
  const r = await pg.queryObject<{ code: string }>(
    SQL_GET_EXISTING_CONCEPT_IDS,
    [ids, allowedSchemeIds],
  );
  return new Set(r.rows.map((row) => row.code));
}

export async function loadAllowlistData(): Promise<AllowlistData> {
  const pg = await getPg();
  const r = await pg.queryObject<{ scheme_id: string; code: string }>(
    SQL_LIST_CONCEPT_CODES_BY_SCHEME,
  );
  const subject = new Set<string>();
  const contentType = new Set<string>();
  const cognitiveLevel = new Set<string>();
  const context = new Set<string>();
  const subjectIds = new Set<string>(SUBJECT_SCHEMES);
  const contentTypeIds = new Set<string>(CONTENT_TYPE_SCHEMES);
  const cognitiveIds = new Set<string>(COGNITIVE_LEVEL_SCHEMES);
  const contextIds = new Set<string>(CONTEXT_SCHEMES);
  for (const row of r.rows) {
    if (subjectIds.has(row.scheme_id)) subject.add(row.code);
    else if (contentTypeIds.has(row.scheme_id)) contentType.add(row.code);
    else if (cognitiveIds.has(row.scheme_id)) cognitiveLevel.add(row.code);
    else if (contextIds.has(row.scheme_id)) context.add(row.code);
  }
  const concept = new Set<string>([
    ...subject,
    ...contentType,
    ...cognitiveLevel,
    ...context,
  ]);
  return {
    subject,
    contentType,
    cognitiveLevel,
    context,
    concept,
  };
}
