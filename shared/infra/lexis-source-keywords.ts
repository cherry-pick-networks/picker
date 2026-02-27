/**
 * Build keyword → source_id pairs from lexis-sources.toml + .env (store.md §V).
 * Used by system/lexis for utterance matching; no hardcoded book names.
 */

import { parse } from "@std/toml";

const LEXIS_SOURCES_TOML = new URL(
  "./seed/lexis/lexis-sources.toml",
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

export function getLexisSourceKeywordPairs(): [string, string][] {
  const raw = Deno.readTextFileSync(LEXIS_SOURCES_TOML);
  const data = parse(raw) as { source?: SourceEntry[] };
  const entries = data.source ?? [];
  const pairs: [string, string][] = [];
  for (const entry of entries) {
    const json = Deno.env.get(entry.env_var);
    if (!json?.trim()) continue;
    try {
      const payload = JSON.parse(json) as { metadata?: Meta };
      const meta = payload.metadata ?? {};
      const title = typeof meta.title === "string" ? meta.title : "";
      if (title) pairs.push([title, entry.source_id]);
      const kws = Array.isArray(meta.keywords) ? meta.keywords : [];
      for (const kw of kws) {
        if (typeof kw === "string" && kw) pairs.push([kw, entry.source_id]);
      }
      pairs.push([entry.source_id, entry.source_id]);
    } catch {
      // skip invalid env entry
    }
  }
  return pairs.slice().sort((a, b) => b[0].length - a[0].length);
}
