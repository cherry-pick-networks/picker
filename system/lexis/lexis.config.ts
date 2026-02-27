/** Allowed lexis source_ids for utterance parsing (align with lexis-sources.toml). */

const LEXIS_ALLOWED_SOURCE_IDS = new Set<string>([
  "lexis-high-basic",
  "lexis-middle-intermediate",
]);

// function-length-ignore — getter (store.md §P)
export function getLexisAllowedSourceIds(): Set<string> {
  return new Set(LEXIS_ALLOWED_SOURCE_IDS);
}
