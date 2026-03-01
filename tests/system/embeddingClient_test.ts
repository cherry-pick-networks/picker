//
// embeddingClient: mock returns fixed vector; no API key returns error.
//

import { assertEquals } from '@std/assert';
import { ContentEmbeddingService } from '#api/search/embeddingClient.ts';

Deno.test(
  'getEmbedding with SEMANTIC_EMBED_MOCK returns fixed vector',
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    try {
      const result = await ContentEmbeddingService
        .getEmbedding('any text');
      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.embedding.length, 1536);
      }
    } finally {
      Deno.env.delete('SEMANTIC_EMBED_MOCK');
    }
  },
);

Deno.test(
  'getEmbedding without mock and no API key returns ok: false',
  async () => {
    const had = Deno.env.get('OPENAI_API_KEY');
    Deno.env.delete('OPENAI_API_KEY');
    try {
      const result = await ContentEmbeddingService
        .getEmbedding('short');
      assertEquals(result.ok, false);
      if (!result.ok) {
        assertEquals(
          result.error,
          'OPENAI_API_KEY not set',
        );
      }
    } finally {
      if (had !== undefined) {
        Deno.env.set('OPENAI_API_KEY', had);
      }
    }
  },
);
