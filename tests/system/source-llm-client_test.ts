/**
 * source-llm.client: mock returns fixed output; no API key returns error.
 */

import { assertEquals } from "@std/assert";
import { extractConcepts } from "#system/source/source-llm.client.ts";

Deno.test("extractConcepts with SOURCE_EXTRACT_LLM_MOCK returns fixed output", async () => {
  Deno.env.set("SOURCE_EXTRACT_LLM_MOCK", "1");
  try {
    const result = await extractConcepts("any passage text");
    assertEquals(result.ok, true);
    if (result.ok) {
      assertEquals(result.output.concept_ids, ["mock-concept-1"]);
      assertEquals(result.output.subject_id, "reading");
    }
  } finally {
    Deno.env.delete("SOURCE_EXTRACT_LLM_MOCK");
  }
});

Deno.test("extractConcepts without mock and no API key returns ok: false", async () => {
  const hadKey = Deno.env.get("OPENAI_API_KEY");
  Deno.env.delete("OPENAI_API_KEY");
  try {
    const result = await extractConcepts("short");
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.error, "OPENAI_API_KEY not set");
  } finally {
    if (hadKey !== undefined) Deno.env.set("OPENAI_API_KEY", hadKey);
  }
});
