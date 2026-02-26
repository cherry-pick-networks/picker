/** Allowed concept scheme IDs per facet. Used by validateFacetSchemes. */

export const SUBJECT_SCHEMES = ["csat-subjects", "ddc"] as const;
export const CONTENT_TYPE_SCHEMES = ["csat-type"] as const;
export const COGNITIVE_LEVEL_SCHEMES = ["csat-cognitive"] as const;
export const CONTEXT_SCHEMES = ["csat-context"] as const;

export type FacetName =
  | "subject"
  | "contentType"
  | "cognitiveLevel"
  | "context"
  | "concept";

const ALL_SCHEMES: readonly string[] = [
  ...SUBJECT_SCHEMES,
  ...CONTENT_TYPE_SCHEMES,
  ...COGNITIVE_LEVEL_SCHEMES,
  ...CONTEXT_SCHEMES,
];

export function getAllowedSchemeIds(facet: FacetName): string[] {
  switch (facet) {
    case "subject":
      return [...SUBJECT_SCHEMES];
    case "contentType":
      return [...CONTENT_TYPE_SCHEMES];
    case "cognitiveLevel":
      return [...COGNITIVE_LEVEL_SCHEMES];
    case "context":
      return [...CONTEXT_SCHEMES];
    case "concept":
      return [...ALL_SCHEMES];
    default:
      return [];
  }
}
