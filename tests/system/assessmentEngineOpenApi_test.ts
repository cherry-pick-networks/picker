//
// POST /content/engines/assessment/generate: type별 200 구조 검증, 잘못된 type/context 시 400.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const dbOpts = () => ({
  sanitizeResources: false,
  ignore: !hasDbEnv(),
});

function post(body: unknown) {
  return handler(
    new Request(
      'http://localhost/content/engines/assessment/generate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    ),
  );
}

Deno.test(
  'POST /content/engines/assessment/generate WRONG_ANSWER returns 200 with options',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await post({
        type: 'WRONG_ANSWER',
        context: { concept_ids: ['c1'], count: 2 },
      });
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body.options), true);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /content/engines/assessment/generate NEXT_ITEM returns 200 with item',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await post({
        type: 'NEXT_ITEM',
        context: { actor_id: 'a1', scheme_id: 's1' },
      });
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(typeof body, 'object');
      if (body.item != null) {
        assertEquals(typeof body.item, 'object');
      }
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /content/engines/assessment/generate DIAGNOSE returns 200 with error_type (mock)',
  dbOpts(),
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    Deno.env.set('DIAGNOSE_MISCONCEPTION_LLM_MOCK', '1');
    try {
      const res = await post({
        type: 'DIAGNOSE',
        context: { response_text: 'He go to school.' },
      });
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(typeof body.error_type, 'string');
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
      Deno.env.delete('DIAGNOSE_MISCONCEPTION_LLM_MOCK');
    }
  },
);

Deno.test(
  'POST /content/engines/assessment/generate returns 400 when type invalid',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await post({
        type: 'INVALID',
        context: {},
      });
      assertEquals(res.status, 400);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /content/engines/assessment/generate returns 400 when context invalid for type',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await post({
        type: 'NEXT_ITEM',
        context: {},
      });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.error != null, true);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
