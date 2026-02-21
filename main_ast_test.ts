import { assert, assertEquals } from "@std/assert";
import { app } from "./main.ts";

const handler = app.handler();
const handlerTestOpts = { sanitizeResources: false };

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
