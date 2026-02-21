import { assertEquals } from "@std/assert";
import { app } from "../../main.ts";

const handler = (req: Request) => app.fetch(req);

Deno.test("POST /ast/apply with invalid body returns 400", async () => {
  const res = await handler(
    new Request("http://localhost/ast/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  );
  assertEquals(res.status, 400);
});

Deno.test("POST /ast/apply with empty path returns 400", async () => {
  const res = await handler(
    new Request("http://localhost/ast/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "   ",
        oldText: "a",
        newText: "b",
      }),
    }),
  );
  assertEquals(res.status, 400);
});

Deno.test("POST /ast/apply with path outside store returns 403", async () => {
  const res = await handler(
    new Request("http://localhost/ast/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "../other",
        oldText: "x",
        newText: "y",
      }),
    }),
  );
  assertEquals(res.status, 403);
});

Deno.test("POST /ast/apply with oldText not in file returns 400", async () => {
  const res = await handler(
    new Request("http://localhost/ast/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "hello.txt",
        oldText: "nonexistent snippet 12345",
        newText: "y",
      }),
    }),
  );
  assertEquals(res.status, 400);
  const j = await res.json();
  assertEquals(j.error, "oldText not found in file");
});

Deno.test("POST /ast/apply succeeds and file content is updated", async () => {
  const target = "ast-patch-target.txt";
  await handler(
    new Request(`http://localhost/scripts/${target}`, {
      method: "POST",
      body: "original line",
    }),
  );
  const res = await handler(
    new Request("http://localhost/ast/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: target,
        oldText: "original",
        newText: "patched",
      }),
    }),
  );
  assertEquals(res.status, 200);
  const getRes = await handler(
    new Request(`http://localhost/scripts/${target}`),
  );
  assertEquals(getRes.status, 200);
  assertEquals(await getRes.text(), "patched line");
});
