//
// POST /report/query: 400 when metrics empty or invalid; 200 with metric keys.
// Uses TEST_SKIP_ENTRA_AUTH so requests are not 401.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';

const handler = (req: Request) => app.fetch(req);
const opts = { sanitizeResources: false };

Deno.test(
  'POST /report/query returns 400 when metrics is empty',
  opts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request('http://localhost/report/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: [] }),
        }),
      );
      assertEquals(res.status, 400);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /report/query returns 400 when metrics has invalid value',
  opts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request('http://localhost/report/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: ['unknown_metric'],
          }),
        }),
      );
      assertEquals(res.status, 400);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /report/query returns 200 with one metric and response key',
  opts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request('http://localhost/report/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: ['plagiarism'] }),
        }),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(
        Object.prototype.hasOwnProperty.call(
          body,
          'plagiarism',
        ),
        true,
      );
      assertEquals(
        Array.isArray(body.plagiarism?.anomalies),
        true,
      );
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'POST /report/query returns 200 with two metrics and response keys',
  opts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request('http://localhost/report/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: [
              'partial_score',
              'formative_summative_gap',
            ],
          }),
        }),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(
        Object.prototype.hasOwnProperty.call(
          body,
          'partial_score',
        ),
        true,
      );
      assertEquals(
        Object.prototype.hasOwnProperty.call(
          body,
          'formative_summative_gap',
        ),
        true,
      );
      assertEquals(
        Array.isArray(body.partial_score?.scores),
        true,
      );
      assertEquals(
        typeof body.formative_summative_gap?.gap,
        'object',
      );
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
