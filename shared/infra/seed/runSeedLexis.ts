/**
 * Seed source table from lexis-sources.toml + .env (store.md §V).
 * Requires db:schema and ontology seeded.
 * Usage: deno run -A shared/infra/seed/runSeedLexis.ts
 */

import { parse } from '@std/toml';
import { createSource } from '#system/source/sourceService.ts';

const LEXIS_SOURCES_TOML = new URL(
  './lexis/lexis-sources.toml',
  import.meta.url,
);

interface SourceEntry {
  source_id: string;
  env_var: string;
}

async function runSeed(): Promise<void> {
  const raw = await Deno.readTextFile(LEXIS_SOURCES_TOML);
  const data = parse(raw) as { source?: SourceEntry[] };
  const entries = data.source ?? [];

  for (const entry of entries) {
    const json = Deno.env.get(entry.env_var);
    if (!json?.trim()) continue;
    const payload = JSON.parse(json) as Record<string, unknown>;
    const body = {
      ...payload,
      source_id: entry.source_id,
      type: (payload.type as string) ?? 'book',
      metadata: (payload.metadata as Record<string, unknown>) ?? {},
    };
    await createSource(body);
    console.log('Seeded source:', entry.source_id);
  }
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
