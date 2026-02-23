/**
 * Run idempotent ontology seed: ontology.sql (DDC) + ontology-architecture.toml.
 * Requires: DATABASE_URL or PG* env; 05_ontology.sql (and add-requires) applied.
 * Run: deno task seed:ontology
 */

import { parse } from "@std/toml";
import { withTx } from "#shared/infra/pg.client.ts";

const ONTOLOGY_SQL_PATH = new URL("ontology.sql", import.meta.url);
const ARCHITECTURE_TOML_PATH = new URL(
  "ontology-architecture.toml",
  import.meta.url,
);

interface ArchitectureSeed {
  scheme: { id: string; pref_label: string };
  concepts: Array<{
    id: string;
    pref_label: string;
    notation?: string;
    path?: string;
    source?: string;
  }>;
  relations?: Array<{
    source_id: string;
    target_id: string;
    relation_type: string;
  }>;
}

async function runSqlSeed(sql: Awaited<ReturnType<typeof import("#shared/infra/pg.client.ts").getPg>>): Promise<void> {
  const body = await Deno.readTextFile(ONTOLOGY_SQL_PATH);
  const statements = body
    .split(/;\s*\n/)
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter((s) => s.length > 0);
  for (const st of statements) {
    await sql.queryArray(st + ";");
  }
}

async function runTomlSeed(sql: Awaited<ReturnType<typeof import("#shared/infra/pg.client.ts").getPg>>, data: ArchitectureSeed): Promise<void> {
  const { scheme, concepts, relations = [] } = data;
  await sql.queryArray(
    `INSERT INTO concept_scheme (id, pref_label)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET pref_label = EXCLUDED.pref_label`,
    [scheme.id, scheme.pref_label],
  );
  for (const c of concepts) {
    await sql.queryArray(
      `INSERT INTO concept (id, scheme_id, pref_label, notation, source, path)
       VALUES ($1, $2, $3, $4, $5, $6::ltree)
       ON CONFLICT (id) DO UPDATE SET
         scheme_id = EXCLUDED.scheme_id,
         pref_label = EXCLUDED.pref_label,
         notation = EXCLUDED.notation,
         source = EXCLUDED.source,
         path = EXCLUDED.path`,
      [
        c.id,
        scheme.id,
        c.pref_label,
        c.notation ?? null,
        c.source ?? null,
        c.path ?? null,
      ],
    );
  }
  for (const r of relations) {
    await sql.queryArray(
      `INSERT INTO concept_relation (source_id, target_id, relation_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (source_id, target_id, relation_type) DO NOTHING`,
      [r.source_id, r.target_id, r.relation_type],
    );
  }
}

async function runSeed(): Promise<void> {
  const tomlBody = await Deno.readTextFile(ARCHITECTURE_TOML_PATH);
  const architecture = parse(tomlBody) as unknown as ArchitectureSeed;
  if (!architecture?.scheme?.id || !Array.isArray(architecture.concepts)) {
    throw new Error("ontology-architecture.toml: expected scheme and concepts");
  }

  await withTx(async (sql) => {
    await runSqlSeed(sql);
    await runTomlSeed(sql, architecture);
  });
}

runSeed()
  .then(() => {
    const message = "Ontology seed done.";
    console.log(message);
  })
  .catch((e) => {
    console.error("Ontology seed failed:", e);
    Deno.exit(1);
  });
