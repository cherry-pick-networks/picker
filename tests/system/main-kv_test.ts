import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";
import { hasDbEnv } from "./db-env_test.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };
const dbTestOpts = () => ({ ...handlerTestOpts, ignore: !hasDbEnv() });

Deno.test(
  "GET /kv/:key returns 200 and value or null",
  dbTestOpts(),
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
  dbTestOpts(),
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
  dbTestOpts(),
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
  dbTestOpts(),
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
