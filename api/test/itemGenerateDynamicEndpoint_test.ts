//
// POST /content/items/generate-dynamic: 400 invalid body, 200 with mock.
// Requires Postgres; use DYNAMIC_ITEM_LLM_MOCK to avoid real API.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { hasDbEnv } from './dbEnv_test.ts';

Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };
const dbTestOpts = () => ({
  ...handlerTestOpts,
  ignore: !hasDbEnv(),
});

Deno.test(
  'POST /content/items/generate-dynamic returns 400 for single concept_id',
  async () => {
    const res = await handler(
      new Request(
        'http://localhost/content/items/generate-dynamic',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept_ids: ['bloom-1'],
            count: 1,
          }),
        },
      ),
    );
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(body.error !== undefined, true);
  },
);

Deno.test(
  'POST /content/items/generate-dynamic returns 200 and items (mock LLM)',
  dbTestOpts(),
  async () => {
    Deno.env.set('DYNAMIC_ITEM_LLM_MOCK', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/items/generate-dynamic',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              concept_ids: ['bloom-1', 'bloom-2'],
              count: 1,
            }),
          },
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body.items), true);
      assertEquals(body.items.length, 1);
      assertEquals(typeof body.items[0].item_id, 'string');
      assertEquals(
        body.items[0].stem,
        'Sample stem (mock).',
      );
      assertEquals(body.items[0].concept_id, 'bloom-1');
    } finally {
      Deno.env.delete('DYNAMIC_ITEM_LLM_MOCK');
    }
  },
);
