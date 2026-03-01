//  Ontology seed: SQL split, TOML load, insert schemes/concepts. Used by runSeedOntology.

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';
import { parse } from '@std/toml';

const ontologyDir = new URL(
  '../../../sharepoint/infra/seed/ontology/',
  import.meta.url,
);
const SEED_SQL = new URL('seed.sql', ontologyDir);
const SQL_INSERT_CONCEPT_SCHEME = await loadSql(
  ontologyDir,
  'insert_concept_scheme.sql',
);
const SQL_INSERT_CONCEPT = await loadSql(
  ontologyDir,
  'insert_concept.sql',
);

export interface SchemeFromToml {
  id: string;
  name: string;
}

export interface ConceptFromToml {
  scheme_id: string;
  code: string;
  pref_label: string;
  path: string;
}

function stripLeadingComments(block: string): string {
  const noComments = block.replace(
    /^\s*(--[^\n]*\n)*/m,
    '',
  );
  return noComments.trim();
}

export function splitStatements(sql: string): string[] {
  const parts = sql.split(';').map((s) =>
    stripLeadingComments(s.trim())
  );
  return parts.filter((s) =>
    s.length > 0 && /^\s*INSERT\s/i.test(s)
  );
}

export async function loadTomlData(url: URL): Promise<{
  schemes: SchemeFromToml[];
  concepts: ConceptFromToml[];
}> {
  const raw = await Deno.readTextFile(url);
  const data = parse(raw) as {
    concept_scheme?: SchemeFromToml[];
    concept?: ConceptFromToml[];
  };
  return {
    schemes: data.concept_scheme ?? [],
    concepts: data.concept ?? [],
  };
}

export async function insertSchemes(
  pg: Awaited<ReturnType<typeof getPg>>,
  schemes: SchemeFromToml[],
): Promise<void> {
  const list = schemes;
  for (const s of list) {
    await pg.queryArray(SQL_INSERT_CONCEPT_SCHEME, [
      s.id,
      s.name,
    ]);
  }
}

export async function insertConcepts(
  pg: Awaited<ReturnType<typeof getPg>>,
  concepts: ConceptFromToml[],
): Promise<void> {
  const list = concepts;
  for (const c of list) {
    await pg.queryArray(SQL_INSERT_CONCEPT, [
      c.scheme_id,
      c.code,
      c.pref_label,
      c.path,
    ]);
  }
}

export async function runSqlSeed(
  pg: Awaited<ReturnType<typeof getPg>>,
): Promise<void> {
  const sql = await Deno.readTextFile(SEED_SQL);
  for (const stmt of splitStatements(sql)) {
    await pg.queryArray(stmt + ';');
  }
}

export { SEED_SQL };
