/**
 * utterance-parser: full flow days + source_id; allowed list injected.
 */

import { assertEquals } from "@std/assert";
import {
  getLexisUtteranceCacheStats,
  parseUtterance,
  parseUtteranceWithFallback,
  resetLexisUtteranceCacheStats,
} from "#system/lexis/utterance-parser.service.ts";

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

Deno.test(
  "parseUtteranceWithFallback returns regex result without calling LLM",
  async () => {
    const hadKey = Deno.env.get("OPENAI_API_KEY");
    Deno.env.delete("OPENAI_API_KEY");
    Deno.env.delete("LEXIS_UTTERANCE_LLM_MOCK");
    try {
      const r = await parseUtteranceWithFallback(
        "워드마스터 중등 실력 1일차",
        ALLOWED,
      );
      assertEquals(r.ok, true);
      if (r.ok) {
        assertEquals(r.source_id, "lexis-middle-intermediate");
        assertEquals(r.days, [1]);
      }
    } finally {
      if (hadKey !== undefined) Deno.env.set("OPENAI_API_KEY", hadKey);
    }
  },
);

Deno.test(
  "parseUtteranceWithFallback uses LLM mock when regex fails",
  async () => {
    Deno.env.set("LEXIS_UTTERANCE_LLM_MOCK", "1");
    try {
      const r = await parseUtteranceWithFallback("그 책 1일차만", ALLOWED);
      assertEquals(r.ok, true);
      if (r.ok) {
        assertEquals(r.source_id, "lexis-middle-intermediate");
        assertEquals(r.days, [1]);
      }
    } finally {
      Deno.env.delete("LEXIS_UTTERANCE_LLM_MOCK");
    }
  },
);

Deno.test(
  "parseUtteranceWithFallback second call uses cache (no extra LLM call)",
  async () => {
    Deno.env.set("LEXIS_UTTERANCE_LLM_MOCK", "1");
    resetLexisUtteranceCacheStats();
    try {
      await parseUtteranceWithFallback("그 책 1일차만", ALLOWED);
      const statsAfterFirst = getLexisUtteranceCacheStats();
      assertEquals(statsAfterFirst.misses, 1);
      assertEquals(statsAfterFirst.hits, 0);
      await parseUtteranceWithFallback("그 책 1일차만", ALLOWED);
      const statsAfterSecond = getLexisUtteranceCacheStats();
      assertEquals(statsAfterSecond.misses, 1);
      assertEquals(statsAfterSecond.hits, 1);
    } finally {
      Deno.env.delete("LEXIS_UTTERANCE_LLM_MOCK");
    }
  },
);
