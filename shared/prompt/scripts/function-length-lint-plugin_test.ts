import { assertEquals } from "jsr:@std/assert";
import plugin from "./function-length-lint-plugin.ts";

Deno.test("function-length: 2–4 lines ok", () => {
  const code = `
function ok() {
  return 1;
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 0);
});

Deno.test("function-length: 1 line block reports", () => {
  const code = "function short() { x(); }";
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, "Function body must be 2–4 lines (got 1).");
});

Deno.test("function-length: 5 lines reports", () => {
  const code = `
function long() {
  const a = 1;
  const b = 2;
  return a + b;
}
`;
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, "Function body must be 2–4 lines (got 5).");
});

Deno.test("function-length: arrow expression body allowed", () => {
  const code = "const f = () => 42;";
  const d = Deno.lint.runPlugin(plugin, "dummy.ts", code);
  assertEquals(d.length, 0);
});
