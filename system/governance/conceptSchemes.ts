//
// Allowed concept scheme IDs per facet. Source of truth:
// shared/infra/seed/ontology/global_standards.toml. Code must match TOML;
// CI: deno task ontology-schemes-check.
//

export const SUBJECT_SCHEMES = ['isced', 'iscedf'] as const;
export const CONTENT_TYPE_SCHEMES = ['doctype'] as const;
export const COGNITIVE_LEVEL_SCHEMES = ['bloom'] as const;
export const CONTEXT_SCHEMES = ['cefr', 'actfl'] as const;

export type FacetName =
  | 'subject'
  | 'contentType'
  | 'cognitiveLevel'
  | 'context'
  | 'concept';

const ALL_SCHEMES: readonly string[] = [
  ...SUBJECT_SCHEMES,
  ...CONTENT_TYPE_SCHEMES,
  ...COGNITIVE_LEVEL_SCHEMES,
  ...CONTEXT_SCHEMES,
];

export function getAllowedSchemeIds(
  facet: FacetName,
): string[] {
  switch (facet) {
    case 'subject':
      return [...SUBJECT_SCHEMES];
    case 'contentType':
      return [...CONTENT_TYPE_SCHEMES];
    case 'cognitiveLevel':
      return [...COGNITIVE_LEVEL_SCHEMES];
    case 'context':
      return [...CONTEXT_SCHEMES];
    case 'concept':
      return [...ALL_SCHEMES];
    default:
      return [];
  }
}
