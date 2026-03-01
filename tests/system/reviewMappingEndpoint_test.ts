//
// POST /content/review/map-to-ontology: 400 when invalid body, 200 with mock.
// Use REVIEW_MAPPING_LLM_MOCK to avoid real API. Allowlist required.
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
  'POST /content/review/map-to-ontology returns 400 when body missing review_text',
  dbOpts(),
  async () => {
    const res = await handler(
      new Request(
        'http://localhost/content/review/map-to-ontology',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      ),
    );
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(body.error != null, true);
  },
);

Deno.test(
  'POST /content/review/map-to-ontology 200 with concept_ids and mapped_at (mock)',
  dbOpts(),
  async () => {
    Deno.env.set('REVIEW_MAPPING_LLM_MOCK', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/review/map-to-ontology',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              review_text:
                'Student understood present simple.',
            }),
          },
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body.concept_ids), true);
      assertEquals(typeof body.mapped_at, 'string');
    } finally {
      Deno.env.delete('REVIEW_MAPPING_LLM_MOCK');
    }
  },
);
