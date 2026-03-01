//
// POST /content/recommend/semantic: 400 when query missing; 200 with mock.
// Uses SEMANTIC_EMBED_MOCK to avoid real API. DB tests need pgvector schema.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const dbOpts = () => ({
  sanitizeResources: false,
  ignore: !hasDbEnv(),
});

Deno.test(
  'POST /content/recommend/semantic returns 400 when query empty',
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/recommend/semantic',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '   ' }),
          },
        ),
      );
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.error != null, true);
    } finally {
      Deno.env.delete('SEMANTIC_EMBED_MOCK');
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /content/recommend/semantic returns 200 and recommendations (mock)',
  dbOpts(),
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/recommend/semantic',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'some query',
              limit: 5,
            }),
          },
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(
        Array.isArray(body.recommendations),
        true,
      );
      if (body.recommendations.length > 0) {
        assertEquals(
          typeof body.recommendations[0].file_name,
          'string',
        );
        assertEquals(
          typeof body.recommendations[0].page ===
              'number' ||
            body.recommendations[0].page === null,
          true,
        );
        assertEquals(
          typeof body.recommendations[0].paragraph,
          'string',
        );
      }
    } finally {
      Deno.env.delete('SEMANTIC_EMBED_MOCK');
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
