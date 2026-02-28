import { assertEquals } from '@std/assert';
import plugin from '../../shared/prompt/scripts/function-length-lint-plugin.ts';

const MSG_OK = (n: number) => `Function body must have 2–4 statements (got ${n}).`;

Deno.test('function-length: 2–4 statements ok', () => {
  const code = `
function ok() {
  const x = 1;
  return x;
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 0);
});

Deno.test('function-length: 1 statement block reports', () => {
  const code = 'function short() { x(); }';
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, MSG_OK(1));
});

Deno.test('function-length: 5 statements reports', () => {
  const code = `
function long() {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  return a + b + c + d;
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, MSG_OK(5));
});

Deno.test('function-length: arrow expression body allowed', () => {
  const code = 'const f = () => 42;';
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 0);
});

Deno.test('function-length: 1 statement (await) reports', () => {
  const code = `
async function get() {
  return await fetch("/api");
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, MSG_OK(1));
});

Deno.test('function-length: 1 statement (chain) reports', () => {
  const code = `
function get() {
  return fetch("/api")
    .then((r) => r.json())
    .catch(() => null);
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 1);
  assertEquals(d[0].message, MSG_OK(1));
});

Deno.test(
  'function-length: single try/catch exempt (complex statement)',
  () => {
    const code = `
function withTry() {
  try {
    return doSomething();
  } catch (e) {
    return fallback();
  }
}
`;
    const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
    assertEquals(d.length, 0);
  },
);

Deno.test('function-length: 2 statements with try/catch ok', () => {
  const code = `
function two() {
  const x = 1;
  try { return x; } catch { return 0; }
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 0);
});

Deno.test('function-length: single switch exempt (complex statement)', () => {
  const code = `
function withSwitch(x: number) {
  switch (x) {
    case 1:
      return "a";
    default:
      return "b";
  }
}
`;
  const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
  assertEquals(d.length, 0);
});

Deno.test(
  'function-length: single block-bodied if exempt (complex statement)',
  () => {
    const code = `
function onlyIf(x: boolean) {
  if (x) {
    doA();
    doB();
  }
}
`;
    const d = Deno.lint.runPlugin(plugin, 'dummy.ts', code);
    assertEquals(d.length, 0);
  },
);
