import {
  ID_COUNT_LIMIT,
  validateFacetSchemes,
} from "#system/concept/concept.service.ts";
import type { CreateItemRequest, ItemPatch } from "./content.schema.ts";

export type FacetCheck = [
  "subject" | "contentType" | "cognitiveLevel" | "context" | "concept",
  string[],
];

function buildFacetChecks(body: CreateItemRequest | ItemPatch): FacetCheck[] {
  const raw = [
    body.subject_ids?.length ? (["subject", body.subject_ids] as const) : null,
    body.content_type_id
      ? (["contentType", [body.content_type_id]] as const)
      : null,
    body.cognitive_level_id
      ? (["cognitiveLevel", [body.cognitive_level_id]] as const)
      : null,
    body.context_ids?.length ? (["context", body.context_ids] as const) : null,
    body.concept_id ? (["concept", [body.concept_id]] as const) : null,
  ].filter((x): x is NonNullable<typeof x> => x != null);
  return raw as FacetCheck[];
}

export async function validateItemFacets(
  body: CreateItemRequest | ItemPatch,
): Promise<void> {
  const checks = buildFacetChecks(body);
  const total = checks.reduce((n, [, ids]) => n + ids.length, 0);
  if (total > ID_COUNT_LIMIT) {
    throw new Error(`Too many concept IDs in request (max ${ID_COUNT_LIMIT})`);
  }
  for (const [facet, ids] of checks) {
    const { invalid } = await validateFacetSchemes(facet, ids);
    if (invalid.length > 0) {
      throw new Error(
        `Invalid concept IDs for ${facet}: ${invalid.join(", ")}`,
      );
    }
  }
}
