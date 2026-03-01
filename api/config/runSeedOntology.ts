//
// Run ontology seed SQL and TOML. Requires db:schema applied first.
// Run: deno task seed:ontology
//

import { getPg } from '#api/postgresql/pgClient.ts';
import {
  insertConcepts,
  insertSchemes,
  loadTomlData,
  runSqlSeed,
} from './runSeedOntologyHelpers.ts';

const ontologyDir = new URL(
  '../../../sharepoint/infra/seed/ontology/',
  import.meta.url,
);
const SEED_GLOBAL_STANDARDS = new URL(
  'global_standards.toml',
  ontologyDir,
);

async function runTomlSeed(
  pg: Awaited<ReturnType<typeof getPg>>,
  url: URL,
): Promise<void> {
  const { schemes, concepts } = await loadTomlData(url);
  await insertSchemes(pg, schemes);
  await insertConcepts(pg, concepts);
}

async function runSeed(): Promise<void> {
  const pg = await getPg();
  await runSqlSeed(pg);
  await runTomlSeed(pg, SEED_GLOBAL_STANDARDS);
  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
