import { assert, assertEquals } from "@std/assert";
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
  "GET /kv returns 200 and { keys: string[] }",
  handlerTestOpts,
  async () => {
    const res = await handler(new Request("http://localhost/kv"));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(Array.isArray(body.keys), true);
  },
);

Deno.test(
  "GET /kv includes key after POST /kv",
  handlerTestOpts,
  async () => {
    const key = `list-${Date.now()}`;
    await handler(
      new Request("http://localhost/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: 1 }),
      }),
    );
    const res = await handler(new Request("http://localhost/kv"));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.keys.includes(key), true);
  },
);

Deno.test(
  "GET /kv?prefix= filters keys by prefix",
  handlerTestOpts,
  async () => {
    const prefix = `pfx-${Date.now()}`;
    const key1 = `${prefix}-a`;
    const key2 = `${prefix}-b`;
    const keyOther = `other-${Date.now()}`;
    for (const k of [key1, key2, keyOther]) {
      await handler(
        new Request("http://localhost/kv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: k, value: 1 }),
        }),
      );
    }
    const res = await handler(
      new Request(`http://localhost/kv?prefix=${prefix}`),
    );
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.keys.includes(key1), true);
    assertEquals(body.keys.includes(key2), true);
    // All returned keys must start with the requested prefix (no keyOther).
    const allMatchPrefix = body.keys.every((k: string) => k.startsWith(prefix));
    assertEquals(allMatchPrefix, true);
  },
);

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
  "DELETE /kv/:key returns 204 and key is gone",
  handlerTestOpts,
  async () => {
    const key = `del-${Date.now()}`;
    await handler(
      new Request("http://localhost/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: "to-delete" }),
      }),
    );
    const delRes = await handler(
      new Request(`http://localhost/kv/${key}`, { method: "DELETE" }),
    );
    assertEquals(delRes.status, 204);
    assertEquals(delRes.body, null);

    const getRes = await handler(new Request(`http://localhost/kv/${key}`));
    assertEquals(getRes.status, 200);
    const getBody = await getRes.json();
    assertEquals(getBody, null);
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

Deno.test(
  "GET /ast-demo returns 200 and HTML that uses GET /ast",
  handlerTestOpts,
  async () => {
    const res = await handler(new Request("http://localhost/ast-demo"));
    assertEquals(res.status, 200);
    assertEquals(
      res.headers.get("Content-Type"),
      "text/html; charset=utf-8",
    );
    const html = await res.text();
    assert(html.includes("AST demo"), "page title or heading");
    assert(html.includes("/ast"), "page fetches GET /ast");
    assert(html.includes("variableDeclarations"), "displays API result");
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
