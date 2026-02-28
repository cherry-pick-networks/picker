/**
 * Tests for line-length helpers: inline ignore pattern (store.md §P).
 */
import { assertEquals } from "@std/assert";
import {
  isLineLengthIgnored,
  LINE_LENGTH_IGNORE_PATTERN,
  MAX_LINE_LENGTH,
} from "../../shared/prompt/scripts/check-line-length-helpers.ts";

Deno.test("LINE_LENGTH_IGNORE_PATTERN: line-length-ignore matches", () => {
  assertEquals(LINE_LENGTH_IGNORE_PATTERN.test("// line-length-ignore"), true);
  assertEquals(
    LINE_LENGTH_IGNORE_PATTERN.test("  // line-length-ignore  "),
    true,
  );
});

Deno.test("LINE_LENGTH_IGNORE_PATTERN: line-length-ignore with reason", () => {
  assertEquals(
    LINE_LENGTH_IGNORE_PATTERN.test("// line-length-ignore: long URL"),
    true,
  );
});

Deno.test("LINE_LENGTH_IGNORE_PATTERN: no match", () => {
  assertEquals(LINE_LENGTH_IGNORE_PATTERN.test("// other"), false);
  assertEquals(LINE_LENGTH_IGNORE_PATTERN.test("line-length-ignore"), false);
});

Deno.test("isLineLengthIgnored: previous line has ignore", () => {
  const lines = ["// line-length-ignore", "x".repeat(MAX_LINE_LENGTH + 1)];
  assertEquals(isLineLengthIgnored(lines, 1), true);
});

Deno.test("isLineLengthIgnored: first line long not ignored", () => {
  const lines = ["x".repeat(MAX_LINE_LENGTH + 1)];
  assertEquals(isLineLengthIgnored(lines, 0), false);
});

Deno.test("isLineLengthIgnored: no ignore on previous line", () => {
  const lines = ["// other comment", "x".repeat(MAX_LINE_LENGTH + 1)];
  assertEquals(isLineLengthIgnored(lines, 1), false);
});

Deno.test("isLineLengthIgnored: ignore-next-line on previous line", () => {
  const lines = ["// line-length-ignore-next-line", "y".repeat(81)];
  assertEquals(isLineLengthIgnored(lines, 1), true);
});
