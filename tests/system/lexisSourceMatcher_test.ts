/**
 * source-matcher: keyword → source_id from .env; allowed list at match time.
 */

import { assertEquals } from "@std/assert";
import {
  clearLexisSourceKeywordCache,
  matchSourceIdByKeyword,
} from "#system/lexis/sourceMatcherConfig.ts";

const ALLOWED = new Set([
  "lexis-high-basic",
  "lexis-middle-basic",
  "lexis-middle-intermediate",
]);

function setLexisEnv(): void {
  Deno.env.set(
    "LEXIS_SOURCE_META_MIDDLE_INTERMEDIATE",
    JSON.stringify({
      type: "book",
      metadata: { title: "워드마스터 중등 실력", keywords: ["중등 실력"] },
    }),
  );
  Deno.env.set(
    "LEXIS_SOURCE_META_MIDDLE_BASIC",
    JSON.stringify({
      type: "book",
      metadata: { title: "워드마스터 중등 Basic", keywords: ["중등 Basic"] },
    }),
  );
  Deno.env.set(
    "LEXIS_SOURCE_META_HIGH_BASIC",
    JSON.stringify({
      type: "book",
      metadata: { title: "워드마스터 고등 Basic", keywords: ["고등 Basic"] },
    }),
  );
  clearLexisSourceKeywordCache();
}

Deno.test("matchSourceIdByKeyword longest match wins", () => {
  setLexisEnv();
  const id = matchSourceIdByKeyword(
    "워드마스터 중등 실력 17일차",
    ALLOWED,
  );
  assertEquals(id, "lexis-middle-intermediate");
});

Deno.test("matchSourceIdByKeyword fallback to shorter keyword", () => {
  setLexisEnv();
  const id = matchSourceIdByKeyword("중등 실력 1일차", ALLOWED);
  assertEquals(id, "lexis-middle-intermediate");
});

Deno.test("matchSourceIdByKeyword 중등 Basic → lexis-middle-basic", () => {
  setLexisEnv();
  const id = matchSourceIdByKeyword("워드마스터 중등 Basic 1일차", ALLOWED);
  assertEquals(id, "lexis-middle-basic");
});

Deno.test("matchSourceIdByKeyword 고등 Basic → lexis-high-basic", () => {
  setLexisEnv();
  const id = matchSourceIdByKeyword("워드마스터 고등 Basic 1일차", ALLOWED);
  assertEquals(id, "lexis-high-basic");
});

Deno.test("matchSourceIdByKeyword no match returns null", () => {
  setLexisEnv();
  assertEquals(
    matchSourceIdByKeyword("완전 다른 책 3일차", ALLOWED),
    null,
  );
});

Deno.test("matchSourceIdByKeyword id not in allowed returns null", () => {
  setLexisEnv();
  const allowedOnlyOne = new Set(["lexis-high-basic"]);
  const id = matchSourceIdByKeyword(
    "워드마스터 중등 실력 17일차",
    allowedOnlyOne,
  );
  assertEquals(id, null);
});
