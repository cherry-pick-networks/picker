import { assert, assertEquals } from "@std/assert";
import { app } from "../../main.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };

async function withServer(
  fn: (base: string) => Promise<void>,
): Promise<void> {
  const ac = new AbortController();
  let listenPort = 0;
  const server = Deno.serve({
    port: 0,
    hostname: "127.0.0.1",
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

Deno.test("E2E POST /kv over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const key = `e2e-${Date.now()}`;
    const value = { e2e: true };
    const postRes = await fetch(`${base}/kv`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
});

Deno.test("E2E GET /scripts over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/scripts`);
    assertEquals(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.entries), "body.entries is array");
  });
});

Deno.test("E2E GET /ast-demo over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/ast-demo`);
    assertEquals(res.status, 200);
    assertEquals(
      res.headers.get("Content-Type"),
      "text/html; charset=utf-8",
    );
    const html = await res.text();
    assert(html.includes("AST demo"), "page title or heading");
    assert(html.includes("/ast"), "page fetches GET /ast");
  });
});

Deno.test("E2E GET / over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/`);
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.ok, true);
  });
});

Deno.test("E2E GET /kv over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/kv`);
    assertEquals(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.keys), "body.keys is array");
  });
});

Deno.test("E2E GET /ast over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/ast`);
    assertEquals(res.status, 200);
    const body = await res.json();
    assert(typeof body.variableDeclarations === "number", "variableDeclarations");
  });
});

Deno.test("E2E GET /scripts/hello.txt over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/scripts/hello.txt`);
    assertEquals(res.status, 200);
    const text = await res.text();
    assert(text.includes("hello from shared/runtime/store"), "file content");
  });
});

Deno.test("E2E GET /static/e2e-smoke.txt over real HTTP", handlerTestOpts, async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/static/e2e-smoke.txt`);
    assertEquals(res.status, 200);
    const text = await res.text();
    assert(text.includes("e2e smoke"), "static file content");
  });
});

Deno.test(
  "E2E load: 20 concurrent GET / complete within 5s",
  handlerTestOpts,
  async () => {
    const concurrency = 20;
    const maxMs = 5000;
    await withServer(async (base) => {
      const start = performance.now();
      const results = await Promise.all(
        Array.from({ length: concurrency }, () =>
          fetch(`${base}/`).then((r) => r.status),
        ),
      );
      const elapsed = performance.now() - start;
      assert(elapsed < maxMs, `all ${concurrency} requests in < ${maxMs}ms`);
      results.forEach((status, i) =>
        assertEquals(status, 200, `request ${i + 1} status`)
      );
    });
  },
);
