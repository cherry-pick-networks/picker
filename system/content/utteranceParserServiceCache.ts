//  Utterance parser: LLM cache TTL, key, get/set, fetch. Used by utteranceParserService.

import type { LexisUtteranceLlmOutput } from '#system/content/material/lexisLlmSchema.ts';
import { ContentLlmService } from '#system/content/ContentLlmService.ts';
import type { UtteranceParseResult } from './utteranceParserServiceTypes.ts';
import {
  cacheKey,
  cacheTtlSec,
  fromLlmOutput,
} from './utteranceParserServiceCacheCore.ts';

const CACHE = new Map<
  string,
  { value: LexisUtteranceLlmOutput; expiresAt: number }
>();
let cacheHits = 0;
let cacheMisses = 0;

export function getLexisUtteranceCacheStats(): {
  hits: number;
  misses: number;
} {
  return { hits: cacheHits, misses: cacheMisses };
}

export function resetLexisUtteranceCacheStats(): void {
  CACHE.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

function getCachedResult(
  key: string,
  now: number,
  allowedSourceIds: Set<string>,
): UtteranceParseResult | null {
  const entry = CACHE.get(key);
  if (entry && entry.expiresAt > now) {
    cacheHits++;
    return fromLlmOutput(entry.value, allowedSourceIds);
  }
  return null;
}

function setCacheIfTtl(
  key: string,
  now: number,
  value: LexisUtteranceLlmOutput,
): void {
  const ttl = cacheTtlSec();
  if (ttl > 0) {
    CACHE.set(key, { value, expiresAt: now + ttl * 1000 });
  }
}

function recordCacheMissAndSet(
  key: string,
  now: number,
  value: LexisUtteranceLlmOutput,
): void {
  cacheMisses++;
  setCacheIfTtl(key, now, value);
}

async function fetchAndCache(
  key: string,
  now: number,
  utterance: string,
  allowedSourceIds: Set<string>,
): Promise<UtteranceParseResult> {
  const llm = await ContentLlmService.parseUtteranceWithLlm(
    utterance,
  );
  if (!llm.ok) return { ok: false, reason: 'parse_error' };
  recordCacheMissAndSet(key, now, llm.output);
  return fromLlmOutput(llm.output, allowedSourceIds);
}

export async function getCachedOrFetch(
  utterance: string,
  allowedSourceIds: Set<string>,
): Promise<UtteranceParseResult> {
  const key = cacheKey(utterance);
  const now = Date.now();
  const cached = getCachedResult(
    key,
    now,
    allowedSourceIds,
  );
  return cached ??
    await fetchAndCache(
      key,
      now,
      utterance,
      allowedSourceIds,
    );
}
