/**
 * Build keyword → source_id pairs from lexis-sources.toml + .env (store.md §V).
 * Used by system/lexis for utterance matching; no hardcoded book names.
 */

import { parse } from '@std/toml';

const LEXIS_SOURCES_TOML = new URL(
  './seed/lexis/lexis-sources.toml',
  import.meta.url,
);

interface SourceEntry {
  source_id: string;
  env_var: string;
}

interface Meta {
  title?: string;
  keywords?: string[];
}

function loadTomlEntries(): SourceEntry[] {
  const raw = Deno.readTextFileSync(LEXIS_SOURCES_TOML);
  const data = parse(raw) as { source?: SourceEntry[] };
  return data.source ?? [];
}

function buildPairsForMeta(
  sourceId: string,
  title: string,
  kws: string[],
): [string, string][] {
  const out: [string, string][] = title ? [[title, sourceId]] : [];
  for (const kw of kws) {
    if (typeof kw === 'string' && kw) out.push([kw, sourceId]);
  }
  out.push([sourceId, sourceId]);
  return out;
}

function getPairsForEntry(entry: SourceEntry): [string, string][] {
  const json = Deno.env.get(entry.env_var);
  if (!json?.trim()) return [];
  try {
    const payload = JSON.parse(json) as { metadata?: Meta };
    const meta = payload.metadata ?? {};
    const title = typeof meta.title === 'string' ? meta.title : '';
    const kws = Array.isArray(meta.keywords) ? meta.keywords : [];
    return buildPairsForMeta(entry.source_id, title, kws);
  } catch {
    return [];
  }
}

export function getLexisSourceKeywordPairs(): [string, string][] {
  const entries = loadTomlEntries();
  const pairs = entries.flatMap((e) => getPairsForEntry(e));
  return pairs.slice().sort((a, b) => b[0].length - a[0].length);
}
