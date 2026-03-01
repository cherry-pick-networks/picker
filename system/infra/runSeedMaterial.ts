//
// Seed source table from material_sources.toml + .env (RULESET.md §V).
// Requires db:schema and ontology seeded. Run: deno task seed:material
//

import { parse } from '@std/toml';
import { createSource } from '#system/content/material/service.ts';

const MATERIAL_SOURCES_TOML = new URL(
  '../../../shared/infra/seed/material/material_sources.toml',
  import.meta.url,
);

interface SourceEntry {
  source_id: string;
  env_var: string;
}

async function runSeed(): Promise<void> {
  const raw = await Deno.readTextFile(MATERIAL_SOURCES_TOML);
  const data = parse(raw) as { source?: SourceEntry[] };
  const entries = data.source ?? [];

  for (const entry of entries) {
    const json = Deno.env.get(entry.env_var);
    if (!json?.trim()) continue;
    const payload = JSON.parse(json) as Record<
      string,
      unknown
    >;
    const body = {
      ...payload,
      source_id: entry.source_id,
      type: (payload.type as string) ?? 'book',
      metadata:
        (payload.metadata as Record<string, unknown>) ?? {},
    };
    await createSource(body);
    console.log('Seeded source:', entry.source_id);
  }
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
