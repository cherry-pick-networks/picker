import { assertEquals } from "@std/assert";
import plugin from "../../shared/prompt/scripts/function-length-lint-plugin.ts";

Deno.test("function-length: 2–4 effective lines ok", () => {
  const code = `
function ok() {
  const x = 1;
  return x;
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 0);
});

Deno.test("function-length: 1 effective line block reports", () => {
  const code = "function short() { x(); }";
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
  assertEquals(
    d[0].message,
    "Function body must have 2–4 lines (80-char units) (got 0).",
  );
});

Deno.test("function-length: 5 effective lines reports", () => {
  const code = `
function long() {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  return a + b + c + d;
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
  assertEquals(
    d[0].message,
    "Function body must have 2–4 lines (80-char units) (got 5).",
  );
});

Deno.test("function-length: arrow expression body allowed", () => {
  const code = "const f = () => 42;";
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 0);
});

Deno.test("function-length: 1 effective line (await) reports", () => {
  const code = `
async function get() {
  return await fetch("/api");
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
});

Deno.test("function-length: 1 effective line (chain) reports", () => {
  const code = `
function get() {
  return fetch("/api").then((r) => r.json()).catch(() => null);
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
});
