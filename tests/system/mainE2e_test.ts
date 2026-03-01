import { assert, assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { hasDbEnv } from './dbEnv_test.ts';
import { withTempScriptsStore } from './with_temp_scripts_store.ts';

Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };
const dbTestOpts = () => ({
  ...handlerTestOpts,
  ignore: !hasDbEnv(),
});

async function withServer(
  fn: (base: string) => Promise<void>,
): Promise<void> {
  const ac = new AbortController();
  let listenPort = 0;
  const server = Deno.serve({
    port: 0,
    hostname: '127.0.0.1',
    signal: ac.signal,
    onListen({ port }) {
      listenPort = port;
    },
  }, handler);
  try {
    while (listenPort === 0) {
      await new Promise((r) => setTimeout(r, 10));
    }
    await fn(`http://127.0.0.1:${listenPort}`);
  } finally {
    ac.abort();
    await server.finished;
  }
}

Deno.test(
  'E2E POST /kv over real HTTP',
  dbTestOpts(),
  async () => {
    await withServer(async (base) => {
      const key = `e2e-${Date.now()}`;
      const value = { e2e: true };
      const postRes = await fetch(`${base}/kv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      assertEquals(postRes.status, 200);
      const postBody = await postRes.json();
      assertEquals(postBody, { key });

      const getRes = await fetch(`${base}/kv/${key}`);
      assertEquals(getRes.status, 200);
      const getBody = await getRes.json();
      assertEquals(getBody, value);
    });
  },
);

Deno.test(
  'E2E GET /scripts over real HTTP',
  handlerTestOpts,
  async () => {
    await withTempScriptsStore(async () => {
      await withServer(async (base) => {
        const res = await fetch(`${base}/scripts`);
        assertEquals(res.status, 200);
        const body = await res.json();
        assert(
          Array.isArray(body.entries),
          'body.entries is array',
        );
      });
    });
  },
);

Deno.test(
  'E2E GET / over real HTTP',
  handlerTestOpts,
  async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/`);
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body.ok, true);
    });
  },
);

Deno.test(
  'E2E GET /kv over real HTTP',
  dbTestOpts(),
  async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/kv`);
      assertEquals(res.status, 200);
      const body = await res.json();
      assert(
        Array.isArray(body.keys),
        'body.keys is array',
      );
    });
  },
);

Deno.test(
  'E2E GET /scripts/hello.txt over real HTTP',
  handlerTestOpts,
  async () => {
    await withTempScriptsStore(async () => {
      await withServer(async (base) => {
        const res = await fetch(
          `${base}/scripts/hello.txt`,
        );
        assertEquals(res.status, 200);
        const text = await res.text();
        assert(
          text.includes('hello from sharepoint/runtime/store'),
          'file content',
        );
      });
    }, { seedHello: true });
  },
);

Deno.test(
  'E2E DELETE /kv/:key over real HTTP',
  dbTestOpts(),
  async () => {
    await withServer(async (base) => {
      const key = `e2e-del-${Date.now()}`;
      const postRes = await fetch(`${base}/kv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: { toDelete: true },
        }),
      });
      assertEquals(postRes.status, 200);

      const delRes = await fetch(`${base}/kv/${key}`, {
        method: 'DELETE',
      });
      assertEquals(delRes.status, 204);

      const getRes = await fetch(`${base}/kv/${key}`);
      assertEquals(getRes.status, 200);
      assertEquals(await getRes.json(), null);
    });
  },
);

Deno.test(
  'E2E POST /scripts over real HTTP',
  handlerTestOpts,
  async () => {
    await withTempScriptsStore(async () => {
      await withServer(async (base) => {
        const filename = `e2e-script-${Date.now()}.txt`;
        const content = 'hello e2e from POST /scripts';
        const postRes = await fetch(
          `${base}/scripts/${filename}`,
          {
            method: 'POST',
            body: content,
          },
        );
        assertEquals(postRes.status, 201);

        const getRes = await fetch(
          `${base}/scripts/${filename}`,
        );
        assertEquals(getRes.status, 200);
        assertEquals(await getRes.text(), content);
      });
    });
  },
);

Deno.test(
  'E2E POST /script/mutate then verify file content',
  handlerTestOpts,
  async () => {
    await withTempScriptsStore(async () => {
      Deno.env.set('MUTATE_LLM_MOCK', '1');
      try {
        await withServer(async (base) => {
          const filename = `e2e-mutate-${Date.now()}.txt`;
          const initial = 'alpha\nbeta\ngamma';
          const postScript = await fetch(
            `${base}/scripts/${filename}`,
            {
              method: 'POST',
              body: initial,
            },
          );
          assertEquals(postScript.status, 201);

          const mutateRes = await fetch(
            `${base}/script/mutate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ path: filename }),
            },
          );
          assertEquals(mutateRes.status, 200);
          const mutateBody = await mutateRes.json();
          assertEquals(mutateBody.ok, true);
          assertEquals(mutateBody.replacements >= 1, true);

          const getRes = await fetch(
            `${base}/scripts/${filename}`,
          );
          assertEquals(getRes.status, 200);
          const after = await getRes.text();
          assertEquals(after.includes('// mutated'), true);
        });
      } finally {
        Deno.env.delete('MUTATE_LLM_MOCK');
      }
    });
  },
);

Deno.test(
  'E2E load: 20 concurrent GET / complete within 5s',
  handlerTestOpts,
  async () => {
    const concurrency = 20;
    const maxMs = 5000;
    await withServer(async (base) => {
      const start = performance.now();
      const results = await Promise.all(
        Array.from(
          { length: concurrency },
          () => fetch(`${base}/`).then((r) => r.status),
        ),
      );
      const elapsed = performance.now() - start;
      assert(
        elapsed < maxMs,
        `all ${concurrency} requests in < ${maxMs}ms`,
      );
      results.forEach((status, i) =>
        assertEquals(status, 200, `request ${i + 1} status`)
      );
    });
  },
);
