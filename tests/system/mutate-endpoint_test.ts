/**
 * POST /script/mutate: body validation, 200/400/403/404 responses.
 */

import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";
import { writeScript } from "#system/script/scripts.store.ts";
import { withTempScriptsStore } from "./with_temp_scripts_store.ts";

const handler = (req: Request) => app.fetch(req);

Deno.test("POST /script/mutate returns 400 for invalid body", async () => {
  const res = await handler(
    new Request("http://localhost/script/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  );
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.ok, false);
  assertEquals(body.status, 400);
});

Deno.test("POST /script/mutate returns 400 for missing path", async () => {
  const res = await handler(
    new Request("http://localhost/script/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "only" }),
    }),
  );
  assertEquals(res.status, 400);
});

Deno.test("POST /script/mutate returns 403 for path escape", async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request("http://localhost/script/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "../../outside" }),
      }),
    );
    assertEquals(res.status, 403);
    const body = await res.json();
    assertEquals(body.ok, false);
    assertEquals(body.status, 403);
  });
});

Deno.test("POST /script/mutate returns 404 for missing file", async () => {
  await withTempScriptsStore(async () => {
    const res = await handler(
      new Request("http://localhost/script/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "missing.txt" }),
      }),
    );
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.ok, false);
    assertEquals(body.status, 404);
  });
});

Deno.test("POST /script/mutate 200 and replacements (mock LLM)", async () => {
  await withTempScriptsStore(async () => {
    Deno.env.set("MUTATE_LLM_MOCK", "1");
    try {
      await writeScript("endpoint-target.txt", "x\ny\nz");
      const res = await handler(
        new Request("http://localhost/script/mutate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "endpoint-target.txt" }),
        }),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body.ok, true);
      assertEquals(typeof body.replacements, "number");
      assertEquals(body.replacements >= 1, true);
    } finally {
      Deno.env.delete("MUTATE_LLM_MOCK");
    }
  });
});
