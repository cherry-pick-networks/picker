/**
 * source-matcher: keyword → source_id with allowed list.
 */

import { assertEquals } from "@std/assert";
import { matchSourceIdByKeyword } from "#system/lexis/source-matcher.config.ts";

const ALLOWED = new Set([
  "lexis-middle-intermediate",
  "lexis-high-basic",
]);

Deno.test("matchSourceIdByKeyword longest match wins", () => {
  const id = matchSourceIdByKeyword(
    "워드마스터 중등 실력 17일차",
    ALLOWED,
  );
  assertEquals(id, "lexis-middle-intermediate");
});

Deno.test("matchSourceIdByKeyword fallback to shorter keyword", () => {
  const id = matchSourceIdByKeyword("중등 실력 1일차", ALLOWED);
  assertEquals(id, "lexis-middle-intermediate");
});

Deno.test("matchSourceIdByKeyword no match returns null", () => {
  assertEquals(
    matchSourceIdByKeyword("완전 다른 책 3일차", ALLOWED),
    null,
  );
});

Deno.test("matchSourceIdByKeyword id not in allowed returns null", () => {
  const allowedOnlyOne = new Set(["lexis-high-basic"]);
  const id = matchSourceIdByKeyword(
    "워드마스터 중등 실력 17일차",
    allowedOnlyOne,
  );
  assertEquals(id, null);
});
