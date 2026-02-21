import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";

const handler = app.handler();

Deno.test("GET /scripts returns 200 and { entries: string[] }", async () => {
  const res = await handler(new Request("http://localhost/scripts"));
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(Array.isArray(body.entries), true);
});

Deno.test("GET /scripts/hello.txt returns 200 and file content", async () => {
  const res = await handler(
    new Request("http://localhost/scripts/hello.txt"),
  );
  assertEquals(res.status, 200);
  const text = await res.text();
  assertEquals(text.includes("hello from ops/scripts"), true);
});

Deno.test("GET /scripts/nonexistent returns 404", async () => {
  const res = await handler(
    new Request("http://localhost/scripts/nonexistent"),
  );
  assertEquals(res.status, 404);
});
