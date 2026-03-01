//
// Content-domain embedding singleton. Uses unified LLM client;
// SEMANTIC_EMBED_MOCK in llmClient.
//

import { embed } from '#api/postgresql/llmClient.ts';

export type EmbedResult =
  | { ok: true; embedding: number[] }
  | { ok: false; error: string };

async function getEmbedding(
  text: string,
): Promise<EmbedResult> {
  return await embed(text);
}

export const ContentEmbeddingService = {
  getEmbedding,
};
