/**
 * Tests for line-length helpers (store.md §P). No line-length-ignore (option B).
 */
import { assertEquals } from '@std/assert';
import {
  effectiveLineCount,
  MAX_LINE_LENGTH,
} from '../../shared/prompt/scripts/check-line-length-helpers.ts';

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
