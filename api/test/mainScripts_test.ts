import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { withTempScriptsStore } from './with_temp_scripts_store.ts';

Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
const handler = (req: Request) => app.fetch(req);

Deno.test('GET /scripts returns 200 and { entries: string[] }', async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request('http://localhost/scripts'),
    );
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(Array.isArray(body.entries), true);
  });
});

Deno.test('GET /scripts/hello.txt returns 200 and file content', async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request('http://localhost/scripts/hello.txt'),
    );
    assertEquals(res.status, 200);
    const text = await res.text();
    assertEquals(
      text.includes('hello from sharepoint/runtime/store'),
      true,
    );
  }, { seedHello: true });
});

Deno.test('GET /scripts/nonexistent returns 404', async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request('http://localhost/scripts/nonexistent'),
    );
    assertEquals(res.status, 404);
  });
});

Deno.test('POST /scripts/post-test.txt -> 201, file readable', async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request(
        'http://localhost/scripts/post-test.txt',
        {
          method: 'POST',
          body: 'content from POST',
        },
      ),
    );
    assertEquals(res.status, 201);
    const getRes = await handler(
      new Request('http://localhost/scripts/post-test.txt'),
    );
    assertEquals(getRes.status, 200);
    assertEquals(await getRes.text(), 'content from POST');
  });
});

Deno.test('POST /scripts/subdir.txt -> 201, content readable', async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request('http://localhost/scripts/subdir.txt', {
        method: 'POST',
        body: 'nested content',
      }),
    );
    assertEquals(res.status, 201);
    const getRes = await handler(
      new Request('http://localhost/scripts/subdir.txt'),
    );
    assertEquals(getRes.status, 200);
    assertEquals(await getRes.text(), 'nested content');
  });
});
