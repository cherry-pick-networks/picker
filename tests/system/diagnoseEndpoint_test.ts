//
// POST /content/diagnose/misconception: 400 when invalid body, 200 with mock.
// Use DIAGNOSE_MISCONCEPTION_LLM_MOCK to avoid real API. Allowlist required.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };
const dbTestOpts = () => ({
  ...handlerTestOpts,
  ignore: !hasDbEnv(),
});

Deno.test(
  'POST /content/diagnose/misconception returns 400 when body missing both options',
  dbTestOpts(),
  async () => {
    const res = await handler(
      new Request(
        'http://localhost/content/diagnose/misconception',
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
  'POST /content/diagnose/misconception 200 with error_type and related_ontology_node (mock)',
  dbTestOpts(),
  async () => {
    Deno.env.set('DIAGNOSE_MISCONCEPTION_LLM_MOCK', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/content/diagnose/misconception',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              response_text: 'He go to school every day.',
            }),
          },
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(typeof body.error_type, 'string');
      assertEquals(
        body.error_type,
        'Student confuses present simple with present continuous.',
      );
      if (body.related_ontology_node != null) {
        assertEquals(
          typeof body.related_ontology_node,
          'string',
        );
      }
    } finally {
      Deno.env.delete('DIAGNOSE_MISCONCEPTION_LLM_MOCK');
    }
  },
);
