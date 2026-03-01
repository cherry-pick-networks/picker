//  Item embedding vector store (pgvector) for semantic item search.

import { getPg } from '#api/postgresql/pgClient.ts';
import { loadSql } from '#api/postgresql/sqlLoader.ts';

const sqlDir = new URL('./', import.meta.url);
const SQL_INSERT = await loadSql(
  sqlDir,
  'insert_item_embedding.sql',
);
const SQL_DELETE = await loadSql(
  sqlDir,
  'delete_item_embedding.sql',
);
const SQL_SEARCH = await loadSql(
  sqlDir,
  'search_item_embeddings.sql',
);

function embeddingToString(emb: number[]): string {
  return '[' + emb.join(',') + ']';
}

export async function insertItemEmbedding(
  itemId: string,
  embedding: number[],
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_INSERT, [
    itemId,
    embeddingToString(embedding),
  ]);
}

export async function deleteItemEmbedding(
  itemId: string,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_DELETE, [itemId]);
}

export type ItemSearchHit = {
  item_id: string;
  score: number;
};

export async function searchItemEmbeddings(
  queryEmbedding: number[],
  limit: number,
): Promise<ItemSearchHit[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ItemSearchHit>(
    SQL_SEARCH,
    [
      embeddingToString(queryEmbedding),
      limit,
    ],
  );
  return r.rows;
}
