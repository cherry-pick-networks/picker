// function-length-ignore-file — Seed runner; loops over schemes/concepts.
/**
 * Run ontology seed SQL and TOML. Requires db:schema applied first.
 * Usage: deno run -A shared/infra/seed/runSeedOntology.ts
 */

import { parse } from '@std/toml';
import { getPg } from '../pgClient.ts';
import { loadSql } from '../sqlLoader.ts';

const ontologyDir = new URL('./ontology/', import.meta.url);
const SEED_SQL = new URL('seed.sql', ontologyDir);
const SQL_INSERT_CONCEPT_SCHEME = await loadSql(
  ontologyDir,
  'insert_concept_scheme.sql',
);
const SQL_INSERT_CONCEPT = await loadSql(ontologyDir, 'insert_concept.sql');
const SEED_GLOBAL_STANDARDS = new URL(
  './ontology/global-standards.toml',
  import.meta.url,
);

function stripLeadingComments(block: string): string {
  const noComments = block.replace(/^\s*(--[^\n]*\n)*/m, '');
  return noComments.trim();
}

function splitStatements(sql: string): string[] {
  const parts = sql.split(';').map((s) => stripLeadingComments(s.trim()));
  return parts.filter((s) => s.length > 0 && /^\s*INSERT\s/i.test(s));
}

interface SchemeFromToml {
  id: string;
  name: string;
}

interface ConceptFromToml {
  scheme_id: string;
  code: string;
  pref_label: string;
  path: string;
}

async function runTomlSeed(
  pg: Awaited<ReturnType<typeof getPg>>,
  url: URL,
): Promise<void> {
  const raw = await Deno.readTextFile(url);
  const data = parse(raw) as {
    concept_scheme?: SchemeFromToml[];
    concept?: ConceptFromToml[];
  };
  const schemes = data.concept_scheme ?? [];
  const concepts = data.concept ?? [];
  for (const s of schemes) {
    await pg.queryArray(SQL_INSERT_CONCEPT_SCHEME, [s.id, s.name]);
  }
  for (const c of concepts) {
    await pg.queryArray(SQL_INSERT_CONCEPT, [
      c.scheme_id,
      c.code,
      c.pref_label,
      c.path,
    ]);
  }
}

async function runSeed(): Promise<void> {
  const pg = await getPg();
  const sql = await Deno.readTextFile(SEED_SQL);
  for (const stmt of splitStatements(sql)) {
    await pg.queryArray(stmt + ';');
  }
  await runTomlSeed(pg, SEED_GLOBAL_STANDARDS);
  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
