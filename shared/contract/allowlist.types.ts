/**
 * Allowlist types only. Data: global-standards.toml; Governance provides it.
 * Source/Mirror use these types and injected data only.
 */

export const SUBJECT_SCHEMES = ["isced", "iscedf"] as const;
export const CONTENT_TYPE_SCHEMES = ["doctype"] as const;
export const COGNITIVE_LEVEL_SCHEMES = ["bloom"] as const;
export const CONTEXT_SCHEMES = ["cefr", "actfl"] as const;

export type SubjectSchemeId = (typeof SUBJECT_SCHEMES)[number];
export type ContentTypeSchemeId = (typeof CONTENT_TYPE_SCHEMES)[number];
export type CognitiveLevelSchemeId = (typeof COGNITIVE_LEVEL_SCHEMES)[number];
export type ContextSchemeId = (typeof CONTEXT_SCHEMES)[number];

export type FacetName =
  | "subject"
  | "contentType"
  | "cognitiveLevel"
  | "context"
  | "concept";

/** Per-facet set of allowed concept IDs (e.g. from DB/seed). */
export type AllowlistData = Partial<Record<FacetName, Set<string>>>;

/** Max concept IDs per request (validation cap). */
export const ALLOWLIST_ID_COUNT_LIMIT = 500;

/** Pure: check id is in set. Use with Governance-provided data only. */
export function allowlistHas(
  data: AllowlistData,
  facet: FacetName,
  id: string,
): boolean {
  const set = data[facet];
  return set != null ? set.has(id) : false;
}
