/**
 * mutate.service: Governance, readScript, block extraction, substitution
 * (with MUTATE_LLM_MOCK so no real LLM call).
 */

import { assertEquals } from "@std/assert";
import { mutateScript } from "#system/script/mutate.service.ts";
import { writeScript } from "#system/script/scripts.store.ts";
import { withTempScriptsStore } from "./with_temp_scripts_store.ts";

Deno.test("mutateScript returns 403 for path escape", async () => {
  await withTempScriptsStore(async () => {
    const result = await mutateScript({ path: "../../etc/passwd" });
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.status, 403);
  });
});

Deno.test("mutateScript returns 404 for missing file", async () => {
  await withTempScriptsStore(async () => {
    const result = await mutateScript({ path: "nonexistent.txt" });
    assertEquals(result.ok, false);
    if (!result.ok) assertEquals(result.status, 404);
  });
});

Deno.test("mutateScript with mock LLM: 200 and replacements", async () => {
  await withTempScriptsStore(async () => {
    Deno.env.set("MUTATE_LLM_MOCK", "1");
    try {
      await writeScript("target.txt", "line1\nline2\nline3");
      const result = await mutateScript({ path: "target.txt" });
      assertEquals(result.ok, true);
      if (result.ok) {
        assertEquals(result.replacements >= 1, true);
      }
      const read = await Deno.readTextFile(
        `${Deno.env.get("SCRIPTS_BASE")}/target.txt`,
      );
      assertEquals(read.includes("// mutated"), true);
    } finally {
      Deno.env.delete("MUTATE_LLM_MOCK");
    }
  });
});

Deno.test("mutateScript with mock LLM and intent: 200", async () => {
  await withTempScriptsStore(async () => {
    Deno.env.set("MUTATE_LLM_MOCK", "1");
    try {
      await writeScript("with-intent.txt", "a\nb\nc");
      const result = await mutateScript({
        path: "with-intent.txt",
        intent: "add comment",
      });
      assertEquals(result.ok, true);
    } finally {
      Deno.env.delete("MUTATE_LLM_MOCK");
    }
  });
});
