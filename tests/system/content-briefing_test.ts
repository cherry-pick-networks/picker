import { assertEquals } from "@std/assert";
import { buildBriefingPrompt } from "#system/content/content.service.ts";

Deno.test(
  "buildBriefingPrompt with missing worksheet returns null",
  { sanitizeResources: false },
  async () => {
    const result = await buildBriefingPrompt({
      worksheet_id: "no-such-worksheet-id",
    });
    assertEquals(result, null);
  },
);
