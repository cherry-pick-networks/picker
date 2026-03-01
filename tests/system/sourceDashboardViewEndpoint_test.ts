//
// GET /views/source-dashboard/:id: 404 when missing, 200 and schema when exists.
// Requires Postgres.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { SourceDashboardViewSchema } from '#api/search/material/dashboardViewSchema.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const dbTestOpts = () => ({
  sanitizeResources: false,
  ignore: !hasDbEnv(),
});

Deno.test(
  'GET /views/source-dashboard/:id returns 404 for missing source',
  dbTestOpts(),
  async () => {
    const res = await handler(
      new Request(
        'http://localhost/views/source-dashboard/nonexistent-view-404',
      ),
    );
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.error, 'Not found');
  },
);

Deno.test(
  'GET /views/source-dashboard/:id returns 200 and view schema when source exists',
  dbTestOpts(),
  async () => {
    const id = `view-dashboard-${Date.now()}`;
    await handler(
      new Request('http://localhost/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_id: id }),
      }),
    );
    const res = await handler(
      new Request(
        `http://localhost/views/source-dashboard/${id}`,
      ),
    );
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(
      SourceDashboardViewSchema.safeParse(body).success,
      true,
    );
    assertEquals(body.source_info.source_id, id);
    assertEquals(typeof body.lexis_summary.total, 'number');
    assertEquals(
      Array.isArray(body.lexis_summary.preview),
      true,
    );
    assertEquals(typeof body.related_items.total, 'number');
    assertEquals(
      Array.isArray(body.related_items.preview_ids),
      true,
    );
    assertEquals(
      Array.isArray(body.related_items.preview),
      true,
    );
  },
);
