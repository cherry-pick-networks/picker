// function-length-ignore-file — Seed runner; loops over schemes/concepts.
/**
 * Run ontology seed SQL and CSAT TOML. Requires db:schema applied first.
 * Usage: deno run -A shared/infra/seed/run-seed-ontology.ts
 */

import { parse } from "@std/toml";
import { getPg } from "../pg.client.ts";

const SEED_SQL = new URL("./ontology/seed.sql", import.meta.url);
const SEED_CSAT = new URL("./csat-ontology.toml", import.meta.url);
const SEED_CSAT_SUBJECTS = new URL(
  "./ontology/csat-subjects.toml",
  import.meta.url,
);

function stripLeadingComments(block: string): string {
  const noComments = block.replace(/^\s*(--[^\n]*\n)*/m, "");
  return noComments.trim();
}

function splitStatements(sql: string): string[] {
  const parts = sql.split(";").map((s) => stripLeadingComments(s.trim()));
  return parts.filter((s) => s.length > 0 && /^\s*INSERT\s/i.test(s));
}

interface CsatScheme {
  id: string;
  name: string;
}

interface CsatConcept {
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
    concept_scheme?: CsatScheme[];
    concept?: CsatConcept[];
  };
  const schemes = data.concept_scheme ?? [];
  const concepts = data.concept ?? [];
  for (const s of schemes) {
    await pg.queryArray(
      `INSERT INTO concept_scheme (scheme_id, name)
       VALUES ($1, $2) ON CONFLICT (scheme_id) DO NOTHING`,
      [s.id, s.name],
    );
  }
  for (const c of concepts) {
    await pg.queryArray(
      `INSERT INTO concept (scheme_id, code, pref_label, path)
       VALUES ($1, $2, $3, $4::ltree) ON CONFLICT (scheme_id, code) DO NOTHING`,
      [c.scheme_id, c.code, c.pref_label, c.path],
    );
  }
}

const LEGACY_SCHEME_ID = "csat-subject";

async function runSeed(): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(
    `DELETE FROM concept WHERE scheme_id = $1`,
    [LEGACY_SCHEME_ID],
  );
  await pg.queryArray(
    `DELETE FROM concept_scheme WHERE scheme_id = $1`,
    [LEGACY_SCHEME_ID],
  );
  const sql = await Deno.readTextFile(SEED_SQL);
  for (const stmt of splitStatements(sql)) {
    await pg.queryArray(stmt + ";");
  }
  await runTomlSeed(pg, SEED_CSAT);
  await runTomlSeed(pg, SEED_CSAT_SUBJECTS);
  await pg.end();
}

runSeed().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
