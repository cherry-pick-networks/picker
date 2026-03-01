//  Unified recommendations: normalize and dedup. Used by recommendationsService.

import type { RecommendStrategy } from './strategy.ts';
import { recommend } from './semanticService.ts';
import { recommendRag } from './ragService.ts';
import type { UnifiedRecommendation } from './recommendationsSchema.ts';

export type QueryPrep = {
  strategy: RecommendStrategy;
  limit: number;
  searchQuery: string;
  conceptIds: string[] | undefined;
};

export type GetRecommendationsResult =
  | { ok: true; recommendations: UnifiedRecommendation[] }
  | { ok: false; status: 400 | 502; message: string };

export function toContent(
  recs: {
    file_name: string;
    page: number | null;
    paragraph: string;
  }[],
): UnifiedRecommendation[] {
  return recs.map((r) => ({
    type: 'content' as const,
    content: r,
  }));
}

export function toItem(
  recs: {
    item_id: string;
    concept_id: string | null;
    stem_excerpt: string | null;
    score: number;
  }[],
): UnifiedRecommendation[] {
  return recs.map((r) => ({
    type: 'item' as const,
    content: r,
  }));
}

function contentKey(
  u: UnifiedRecommendation,
): string | null {
  if (u.type !== 'content') return null;
  return `${u.content.file_name}:${u.content.page}:${
    u.content.paragraph.slice(0, 50)
  }`;
}

function seenOnce(seen: Set<string>, key: string): boolean {
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}

export function dedupContent(
  list: UnifiedRecommendation[],
): UnifiedRecommendation[] {
  const seen = new Set<string>();
  return list.filter((u) => {
    const key = contentKey(u);
    if (key === null) return true;
    return seenOnce(seen, key);
  });
}

export function mergeSemanticRag(
  sem: Awaited<ReturnType<typeof recommend>>,
  rag: Awaited<ReturnType<typeof recommendRag>>,
  limit: number,
): UnifiedRecommendation[] {
  const combined: UnifiedRecommendation[] = [];
  if (sem.ok) {
    combined.push(...toContent(sem.recommendations));
  }
  if (rag.ok) {
    combined.push(...toContent(rag.recommendations));
  }
  return dedupContent(combined).slice(0, limit);
}
