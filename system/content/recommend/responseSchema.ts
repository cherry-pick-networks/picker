//
// Copilot-facing recommendation response: file_name, page, paragraph.
// Used by semantic and RAG recommend APIs (Stream A / E).
// ItemRecommendation for semantic item search (Stream 3).
//

export type ItemRecommendation = {
  item_id: string;
  concept_id: string | null;
  stem_excerpt: string | null;
  score: number;
};

export function itemToRecommendation(
  itemId: string,
  payload: Record<string, unknown> | null,
  score: number,
): ItemRecommendation {
  const conceptId =
    payload && typeof payload['concept_id'] === 'string'
      ? (payload['concept_id'] as string)
      : null;
  const stem =
    payload && typeof payload['stem'] === 'string'
      ? (payload['stem'] as string)
      : null;
  const stemExcerpt = stem
    ? stem.trim().slice(0, 200)
    : null;
  return {
    item_id: itemId,
    concept_id: conceptId,
    stem_excerpt: stemExcerpt,
    score,
  };
}

export type CopilotRecommendation = {
  file_name: string;
  page: number | null;
  paragraph: string;
};

export function chunkToRecommendation(
  fileDisplayName: string,
  page: number | null,
  text: string,
): CopilotRecommendation {
  const paragraph =
    text.trim().split(/\n/)[0]?.slice(0, 200) ??
      text.slice(0, 200);
  return {
    file_name: fileDisplayName,
    page,
    paragraph,
  };
}

export function sourceToFileDisplayName(
  sourceId: string,
  metadata?: Record<string, unknown> | null,
  url?: string | null,
): string {
  const fromMeta =
    metadata && typeof metadata['file_name'] === 'string'
      ? (metadata['file_name'] as string)
      : null;
  if (fromMeta) return fromMeta;
  if (url && url.length > 0) return url;
  return sourceId;
}

export function sourceToPage(
  chunkIndex: number,
  metadata?: Record<string, unknown> | null,
): number | null {
  if (metadata && typeof metadata['page'] === 'number') {
    return metadata['page'] as number;
  }
  return chunkIndex + 1;
}
