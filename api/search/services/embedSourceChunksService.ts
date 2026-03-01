//
// Chunk and embed source body; store in vector table.
//

import { chunkBody } from './chunkSource.ts';
import { ContentEmbeddingService } from './ContentEmbeddingService.ts';
import { ContentStores } from '#api/storage/ContentStores.ts';
import { getSource } from '#api/storage/catalog/service.ts';

export type EmbedResult =
  | { ok: true }
  | { ok: false; status: 400 | 404 | 502; message: string };

function bodyOrError(
  source: { body: unknown },
): EmbedResult | { body: string } {
  const body = source.body;
  if (typeof body !== 'string' || body.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'Source has no body',
    };
  }
  return { body };
}

async function getSourceAndBody(
  sourceId: string,
): Promise<EmbedResult | { body: string }> {
  const source = await getSource(sourceId);
  if (source == null) {
    return { ok: false, status: 404, message: 'Not found' };
  }
  return bodyOrError(source);
}

async function runChunkAndEmbed(
  sourceId: string,
  body: string,
): Promise<EmbedResult> {
  try {
    const chunks = chunkBody(body);
    if (chunks.length === 0) return { ok: true };
    await embedAndStoreChunks(sourceId, chunks);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith('OPENAI') ? 502 : 400;
    return { ok: false, status, message: msg };
  }
}

async function embedAndStoreChunks(
  sourceId: string,
  chunks: string[],
): Promise<void> {
  await ContentStores.chunkStore.deleteChunksBySourceId(
    sourceId,
  );
  for (let i = 0; i < chunks.length; i++) {
    const res = await ContentEmbeddingService.getEmbedding(
      chunks[i],
    );
    if (!res.ok) throw new Error(res.error);
    await ContentStores.chunkStore.insertChunk(
      sourceId,
      i,
      chunks[i],
      res.embedding,
    );
  }
}

//  Chunk and embed source body; store in vector table.
export async function embedSourceChunks(
  sourceId: string,
): Promise<EmbedResult> {
  const x = await getSourceAndBody(sourceId);
  if ('ok' in x && x.ok === false) return x;
  return runChunkAndEmbed(sourceId, x.body);
}
