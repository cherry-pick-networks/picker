//  Allowed lexis source_ids for parsing (align with material_sources.toml).

const LEXIS_ALLOWED_SOURCE_IDS = new Set<string>([
  'lexis-high-basic',
  'lexis-middle-basic',
  'lexis-middle-intermediate',
]);

export function getLexisAllowedSourceIds(): Set<string> {
  return new Set(LEXIS_ALLOWED_SOURCE_IDS);
}
