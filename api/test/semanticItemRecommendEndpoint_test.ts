//
// POST /content/recommend/semantic-items: 400 when query missing; 200 with mock.
// Uses SEMANTIC_EMBED_MOCK. DB tests need item_embedding schema (11_item_embedding).
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
  'POST /content/recommend/semantic-items returns 400 when query empty',
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/recommend/semantic-items',
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
  'POST /content/recommend/semantic-items returns 200 and recommendations (mock)',
  dbOpts(),
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/recommend/semantic-items',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'some item query',
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
          typeof body.recommendations[0].item_id,
          'string',
        );
        assertEquals(
          typeof body.recommendations[0].concept_id ===
              'string' ||
            body.recommendations[0].concept_id === null,
          true,
        );
        assertEquals(
          typeof body.recommendations[0].stem_excerpt ===
              'string' ||
            body.recommendations[0].stem_excerpt === null,
          true,
        );
        assertEquals(
          typeof body.recommendations[0].score,
          'number',
        );
      }
    } finally {
      Deno.env.delete('SEMANTIC_EMBED_MOCK');
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
