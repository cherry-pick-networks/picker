/**
 * Keyword → source_id from .env (lexis-sources.toml + LEXIS_SOURCE_META_*).
 * Longest match wins. Allowed list passed at match time.
 */
import { getLexisSourceKeywordPairs } from '#shared/infra/lexisSourceKeywords.ts';

let cached: [string, string][] | null = null;

function getPairs(): [string, string][] {
  if (cached == null) cached = getLexisSourceKeywordPairs();
  return cached;
}

export function clearLexisSourceKeywordCache(): void {
  cached = null;
  return;
}

export function matchSourceIdByKeyword(
  utterance: string,
  allowedIds: Set<string>,
): string | null {
  const trimmed = utterance.trim();
  for (const [keyword, sourceId] of getPairs()) {
    if (!trimmed.includes(keyword)) continue;
    if (allowedIds.has(sourceId)) return sourceId;
  }
  return null;
}
