import { assertEquals } from "@std/assert";
import { add } from "./system/service/add.ts";
import { app } from "./main.ts";

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});

const handler = app.handler();

// App uses Deno KV; tests do not close it, so disable resource sanitizer for handler tests.
const handlerTestOpts = { sanitizeResources: false };

Deno.test("GET / returns 200 and { ok: true }", handlerTestOpts, async () => {
  const res = await handler(new Request("http://localhost/"));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body, { ok: true });
});

Deno.test(
  "GET /kv/:key returns 200 and value or null",
  handlerTestOpts,
  async () => {
    const res = await handler(
      new Request("http://localhost/kv/test-key-missing"),
    );
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body, null);
  },
);

Deno.test(
  "POST /kv writes and GET /kv/:key reads",
  handlerTestOpts,
  async () => {
    const key = `test-${Date.now()}`;
    const value = { foo: "bar" };
    const postRes = await handler(
      new Request("http://localhost/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      }),
    );
    assertEquals(postRes.status, 200);
    const postBody = await postRes.json();
    assertEquals(postBody, { key });

    const getRes = await handler(new Request(`http://localhost/kv/${key}`));
    assertEquals(getRes.status, 200);
    const getBody = await getRes.json();
    assertEquals(getBody, value);
  },
);

Deno.test(
  "POST /kv with invalid body returns 400",
  handlerTestOpts,
  async () => {
    const res = await handler(
      new Request("http://localhost/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notKey: "x" }),
      }),
    );
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(typeof body.error === "object", true);
  },
);

Deno.test(
  "GET /ast returns 200 and variableDeclarations count",
  handlerTestOpts,
  async () => {
    const res = await handler(new Request("http://localhost/ast"));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(typeof body.variableDeclarations, "number");
    assertEquals(body.variableDeclarations, 1);
  },
);

// E2E: real HTTP server (Deno.serve), then fetch to POST /kv and GET /kv/:key.
Deno.test("E2E POST /kv over real HTTP", handlerTestOpts, async () => {
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
    const base = `http://127.0.0.1:${listenPort}`;
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
  } finally {
    ac.abort();
    await server.finished;
  }
});
