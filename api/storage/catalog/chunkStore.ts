//  Source chunk vector store (pgvector).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';

const sqlDir = new URL('../sql/', import.meta.url);
const SQL_INSERT = await loadSql(
  sqlDir,
  'insert_source_chunk.sql',
);
const SQL_DELETE = await loadSql(
  sqlDir,
  'delete_source_chunks.sql',
);
const SQL_SEARCH = await loadSql(
  sqlDir,
  'search_source_chunks.sql',
);

function embeddingToString(emb: number[]): string {
  return '[' + emb.join(',') + ']';
}

export async function insertChunk(
  sourceId: string,
  chunkIndex: number,
  text: string,
  embedding: number[],
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_INSERT, [
    sourceId,
    chunkIndex,
    text,
    embeddingToString(embedding),
  ]);
}

export async function deleteChunksBySourceId(
  sourceId: string,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_DELETE, [sourceId]);
}

export type SearchHit = {
  source_id: string;
  chunk_index: number;
  text: string;
  score: number;
};

export async function searchChunks(
  queryEmbedding: number[],
  limit: number,
): Promise<SearchHit[]> {
  const pg = await getPg();
  const r = await pg.queryObject<SearchHit>(SQL_SEARCH, [
    embeddingToString(queryEmbedding),
    limit,
  ]);
  return r.rows;
}
