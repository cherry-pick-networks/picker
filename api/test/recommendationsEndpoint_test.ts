//
// GET /content/recommendations: 400 when intent missing; 200 and common schema.
// Uses SEMANTIC_EMBED_MOCK; DB tests need pgvector schema.
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
  'GET /content/recommendations returns 400 when intent missing',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const url = new URL(
        'http://localhost/content/recommendations',
      );
      url.searchParams.set('actor_id', 'a1');
      url.searchParams.set('query', 'q');
      const res = await handler(
        new Request(url.toString()),
      );
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.error != null, true);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'GET /content/recommendations returns 400 when actor_id missing',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const url = new URL(
        'http://localhost/content/recommendations',
      );
      url.searchParams.set('intent', 'review');
      url.searchParams.set('query', 'q');
      const res = await handler(
        new Request(url.toString()),
      );
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.error != null, true);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'GET /content/recommendations returns 200 and recommendations (mock)',
  dbOpts(),
  async () => {
    Deno.env.set('SEMANTIC_EMBED_MOCK', '1');
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const url = new URL(
        'http://localhost/content/recommendations',
      );
      url.searchParams.set('actor_id', 'a1');
      url.searchParams.set('intent', 'review');
      url.searchParams.set('query', 'some query');
      url.searchParams.set('limit', '5');
      const res = await handler(
        new Request(url.toString()),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(
        Array.isArray(body.recommendations),
        true,
      );
      if (body.recommendations.length > 0) {
        const first = body.recommendations[0];
        assertEquals(first.type != null, true);
        assertEquals(
          first.type === 'content' || first.type === 'item',
          true,
        );
        if (first.type === 'content') {
          assertEquals(
            typeof first.content.file_name,
            'string',
          );
          assertEquals(
            typeof first.content.page === 'number' ||
              first.content.page === null,
            true,
          );
          assertEquals(
            typeof first.content.paragraph,
            'string',
          );
        }
        if (first.type === 'item') {
          assertEquals(
            typeof first.content.item_id,
            'string',
          );
          assertEquals(
            typeof first.content.concept_id === 'string' ||
              first.content.concept_id === null,
            true,
          );
          assertEquals(
            typeof first.content.score,
            'number',
          );
        }
      }
    } finally {
      Deno.env.delete('SEMANTIC_EMBED_MOCK');
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
