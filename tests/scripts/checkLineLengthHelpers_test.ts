//
// Tests for line-length helpers (RULESET.md §P). No line-length-ignore (option B).
//
import { assertEquals } from '@std/assert';
import {
  effectiveLineCount,
  isCommentOnlyLine,
  MAX_LINE_LENGTH,
} from '../../sharepoint/context/scripts/checkLineLengthHelpers.ts';

Deno.test('MAX_LINE_LENGTH is 100', () => {
  assertEquals(MAX_LINE_LENGTH, 100);
});

Deno.test('effectiveLineCount: empty is 0', () => {
  assertEquals(effectiveLineCount([]), 0);
});

Deno.test('effectiveLineCount: one short line is 1', () => {
  assertEquals(effectiveLineCount(['x']), 1);
});

Deno.test('effectiveLineCount: one line of 100 chars is 1', () => {
  assertEquals(effectiveLineCount(['x'.repeat(100)]), 1);
});

Deno.test('effectiveLineCount: one line of 101 chars is 2', () => {
  assertEquals(effectiveLineCount(['x'.repeat(101)]), 2);
});

Deno.test('effectiveLineCount: comment-only lines excluded', () => {
  assertEquals(
    effectiveLineCount(['// comment', '  //', '//']),
    0,
  );
});

// Block comments are disallowed (§S); if present they count as code lines.
Deno.test('effectiveLineCount: block-looking lines counted as code', () => {
  assertEquals(
    effectiveLineCount(['/* comment */', '  /* a */']),
    2,
  );
  assertEquals(
    effectiveLineCount(['/*', ' * x', ' */']),
    3,
  );
});

Deno.test('effectiveLineCount: code plus inline comment counted', () => {
  assertEquals(
    effectiveLineCount(['const x = 1; // comment']),
    1,
  );
});

Deno.test('effectiveLineCount: mixed comments and code', () => {
  assertEquals(
    effectiveLineCount([
      '// header',
      'export function f() {}',
      '// footer',
    ]),
    1,
  );
});

Deno.test('effectiveLineCount: string with // not treated as comment', () => {
  assertEquals(effectiveLineCount(['const s = "//";']), 1);
});

Deno.test('isCommentOnlyLine: empty and //', () => {
  assertEquals(isCommentOnlyLine(''), true);
  assertEquals(isCommentOnlyLine('  // comment'), true);
});

Deno.test('isCommentOnlyLine: code line not comment', () => {
  assertEquals(isCommentOnlyLine('const x = 1;'), false);
});
