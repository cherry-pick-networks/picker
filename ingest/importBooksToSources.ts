//
// One-off import: temp/books (3 directories = 3 books) into Source table.
// Run with DATABASE_URL set and ontology seeded:
//   deno run -A ingest/importBooksToSources.ts
//

import { createSource } from '#api/storage/catalog/service.ts';
import { loadBookBody } from '#api/search/jobs/importBooksToSourcesHelpers.ts';

const BOOKS_ROOT =
  new URL('../temp/books/', import.meta.url).pathname;

const LEVELS = [
  'basic',
  'intermediate',
  'advanced',
] as const;

async function main(): Promise<void> {
  for (const level of LEVELS) {
    const sourceId = `book-grammar-${level}`;
    const { body, unitIds } = await loadBookBody(
      BOOKS_ROOT,
      level,
    );
    const metadata: Record<string, unknown> = {
      level,
      unit_count: unitIds.length,
      unit_ids: unitIds,
      has_study_guide: true,
    };
    try {
      const source = await createSource({
        source_id: sourceId,
        type: 'book',
        body,
        metadata,
      });
      console.log(
        'Created source:',
        source.source_id,
        'body length:',
        source.body?.length ?? 0,
      );
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : String(err);
      if (msg.includes('Invalid document_type')) {
        console.error(
          'Validation failed for',
          sourceId,
          msg,
        );
        throw err;
      }
      throw err;
    }
  }
  console.log('Done. 3 sources created.');
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
