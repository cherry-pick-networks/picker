/**
 * Keyword → source_id mapping for utterance parsing.
 * Longest match wins. Load allowed list from sources; this is static overlay.
 */

const PAIRS: [string, string][] = [
  ["워드마스터 중등 실력", "lexis-middle-intermediate"],
  ["워드마스터 중등 Basic", "lexis-high-basic"],
  ["중등 실력", "lexis-middle-intermediate"],
  ["중등 Basic", "lexis-high-basic"],
  ["lexis-middle-intermediate", "lexis-middle-intermediate"],
  ["lexis-high-basic", "lexis-high-basic"],
];
export const KEYWORD_TO_SOURCE_ID: [string, string][] = PAIRS.slice().sort(
  (a, b) => b[0].length - a[0].length,
);

export function matchSourceIdByKeyword(
  utterance: string,
  allowedIds: Set<string>,
): string | null {
  const trimmed = utterance.trim();
  for (const [keyword, sourceId] of KEYWORD_TO_SOURCE_ID) {
    if (!trimmed.includes(keyword)) continue;
    if (allowedIds.has(sourceId)) return sourceId;
  }
  return null;
}
