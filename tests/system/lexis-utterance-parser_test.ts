/**
 * utterance-parser: full flow days + source_id; allowed list injected.
 */

import { assertEquals } from "@std/assert";
import { parseUtterance } from "#system/lexis/utterance-parser.service.ts";

const ALLOWED = new Set([
  "lexis-middle-intermediate",
  "lexis-high-basic",
]);

Deno.test("parseUtterance success", () => {
  const r = parseUtterance(
    "워드마스터 중등 실력 17·18일차 단어 알려줘",
    ALLOWED,
  );
  assertEquals(r.ok, true);
  if (r.ok) {
    assertEquals(r.source_id, "lexis-middle-intermediate");
    assertEquals(r.days, [17, 18]);
  }
});

Deno.test("parseUtterance no_days when no day pattern", () => {
  const r = parseUtterance("워드마스터 중등 실력 단어 알려줘", ALLOWED);
  assertEquals(r.ok, false);
  if (!r.ok) assertEquals(r.reason, "no_days");
});

Deno.test("parseUtterance unknown_source when no keyword match", () => {
  const r = parseUtterance("다른 책 17일차", ALLOWED);
  assertEquals(r.ok, false);
  if (!r.ok) assertEquals(r.reason, "unknown_source");
});
