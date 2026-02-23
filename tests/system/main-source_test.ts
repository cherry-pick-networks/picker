/**
 * GET/POST /sources, GET /sources/:id. Require Postgres (DATABASE_URL or PGHOST).
 */

import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };

function hasPgEnv(): boolean {
  return (
    Deno.env.get("DATABASE_URL") !== undefined ||
    Deno.env.get("PGHOST") !== undefined
  );
}

Deno.test(
  "GET /sources returns 200 and { sources: array } when PG set",
  { ...handlerTestOpts, ignore: !hasPgEnv() },
  async () => {
    const res = await handler(new Request("http://localhost/sources"));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(Array.isArray(body.sources), true);
  },
);

Deno.test(
  "POST /sources creates and GET /sources/:id returns it when PG set",
  { ...handlerTestOpts, ignore: !hasPgEnv() },
  async () => {
    const id = `test-src-${Date.now()}`;
    const payload = { source_id: id, url: "https://example.com", type: "web" };
    const postRes = await handler(
      new Request("http://localhost/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
    assertEquals(postRes.status, 201);
    const postBody = await postRes.json();
    assertEquals(postBody.source_id, id);

    const getRes = await handler(new Request(`http://localhost/sources/${id}`));
    assertEquals(getRes.status, 200);
    const getBody = await getRes.json();
    assertEquals(getBody.source_id, id);
    assertEquals(getBody.url, "https://example.com");
  },
);

Deno.test(
  "GET /sources/:id for missing id returns 404 when PG set",
  { ...handlerTestOpts, ignore: !hasPgEnv() },
  async () => {
    const res = await handler(
      new Request("http://localhost/sources/nonexistent-id-404"),
    );
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.error, "Not found");
  },
);
