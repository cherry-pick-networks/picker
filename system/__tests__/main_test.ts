import { assertEquals } from "@std/assert";
import { add } from "../service/add.ts";
import { app } from "../../main.ts";

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});

const handler = app.handler();
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
    const allMatchPrefix = body.keys.every((k: string) => k.startsWith(prefix));
    assertEquals(allMatchPrefix, true);
  },
);
