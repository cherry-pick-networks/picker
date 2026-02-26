/**
 * One-off import: temp/books (3 directories = 3 books) into Source table.
 * Run with DATABASE_URL set and ontology seeded: deno run -A scripts/import-books-to-sources.ts
 */

import { createSource } from "#system/source/source.service.ts";

const BOOKS_ROOT = new URL("../temp/books/", import.meta.url).pathname;

const LEVELS = ["basic", "intermediate", "advanced"] as const;

function parseUnitNumber(name: string): number | null {
  const m = /^unit_(\d+)\.md$/.exec(name);
  return m ? parseInt(m[1], 10) : null;
}

async function loadBookBody(level: string): Promise<{ body: string; unitIds: string[] }> {
  const dir = `${BOOKS_ROOT}${level}`;
  const entries: { name: string; num: number | null }[] = [];
  for await (const e of Deno.readDir(dir)) {
    if (!e.isFile || !e.name.endsWith(".md")) continue;
    const num = parseUnitNumber(e.name);
    entries.push({ name: e.name, num: num });
  }
  const unitEntries = entries.filter((e) => e.num != null).sort((a, b) => a.num! - b.num!);
  const studyGuide = entries.find((e) => e.name === "study_guide.md");
  const unitIds = unitEntries.map((e) => e.name.replace(/\.md$/, ""));
  const parts: string[] = [];
  for (const e of unitEntries) {
    const path = `${dir}/${e.name}`;
    parts.push(await Deno.readTextFile(path));
  }
  if (studyGuide) {
    parts.push(await Deno.readTextFile(`${dir}/${studyGuide.name}`));
  }
  const body = parts.join("\n\n---\n\n");
  return { body, unitIds };
}

async function main(): Promise<void> {
  for (const level of LEVELS) {
    const sourceId = `book-grammar-${level}`;
    const { body, unitIds } = await loadBookBody(level);
    const metadata: Record<string, unknown> = {
      level,
      unit_count: unitIds.length,
      unit_ids: unitIds,
      has_study_guide: true,
    };
    try {
      const source = await createSource({
        source_id: sourceId,
        type: "book",
        body,
        metadata,
      });
      console.log("Created source:", source.source_id, "body length:", source.body?.length ?? 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Invalid document_type")) {
        console.error("Validation failed for", sourceId, msg);
        throw err;
      }
      throw err;
    }
  }
  console.log("Done. 3 sources created.");
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
