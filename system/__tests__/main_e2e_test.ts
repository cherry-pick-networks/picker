import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };

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
