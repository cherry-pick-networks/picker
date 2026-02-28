/**
 * POST /sources/:id/extract: 404 when missing, 400 when no body, 200 with mock.
 * Requires Postgres; use SOURCE_EXTRACT_LLM_MOCK to avoid real API.
 */

import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";
import { hasDbEnv } from "./dbEnv_test.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };
const dbTestOpts = () => ({ ...handlerTestOpts, ignore: !hasDbEnv() });

Deno.test(
  "POST /sources/:id/extract returns 404 for missing source",
  dbTestOpts(),
  async () => {
    const res = await handler(
      new Request("http://localhost/sources/nonexistent-id-404/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.ok, false);
    assertEquals(body.status, 404);
  },
);

Deno.test(
  "POST /sources/:id/extract returns 400 when source has no body",
  dbTestOpts(),
  async () => {
    const id = `no-body-${Date.now()}`;
    await handler(
      new Request("http://localhost/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: id, url: "https://example.com" }),
      }),
    );
    const res = await handler(
      new Request(`http://localhost/sources/${id}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    assertEquals(res.status, 400);
    const body = await res.json();
    assertEquals(body.ok, false);
    assertEquals(body.status, 400);
  },
);

Deno.test(
  "POST /sources/:id/extract 200 and concept_ids (mock LLM)",
  dbTestOpts(),
  async () => {
    Deno.env.set("SOURCE_EXTRACT_LLM_MOCK", "1");
    try {
      const id = `extract-ok-${Date.now()}`;
      await handler(
        new Request("http://localhost/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_id: id,
            body: "This passage is about reading comprehension.",
          }),
        }),
      );
      const res = await handler(
        new Request(`http://localhost/sources/${id}/extract`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body.ok, true);
      assertEquals(Array.isArray(body.concept_ids), true);
      assertEquals(body.concept_ids, ["bloom-1"]);
      assertEquals(body.subject_id, "iscedf-02");
      assertEquals(typeof body.extracted_at, "string");
    } finally {
      Deno.env.delete("SOURCE_EXTRACT_LLM_MOCK");
    }
  },
);
