//
// GET /identity/schedule/review-warnings: 400 when actor_id missing or
// retention_min invalid; 200 with { warnings } when DB available.
// Uses TEST_SKIP_ENTRA_AUTH so requests are not 401.
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
  'GET /identity/schedule/review-warnings returns 400 when actor_id missing',
  handlerTestOpts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/identity/schedule/review-warnings',
        ),
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
  'GET /identity/schedule/review-warnings returns 400 when retention_min invalid',
  handlerTestOpts,
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/identity/schedule/review-warnings?actor_id=a1&retention_min=1.5',
        ),
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
  'GET /identity/schedule/review-warnings returns 200 with warnings array',
  dbTestOpts(),
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/identity/schedule/review-warnings?actor_id=test-actor',
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body.warnings), true);
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
