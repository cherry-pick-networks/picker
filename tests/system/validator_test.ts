import { assertEquals } from "@std/assert";
import { verifyGovernance } from "../../system/script/governance.validation.ts";

Deno.test("verifyGovernance allows empty path for list", () => {
  const r = verifyGovernance("read", "");
  assertEquals(r.allowed, true);
});

Deno.test("verifyGovernance allows path under shared/runtime/store", () => {
  assertEquals(verifyGovernance("read", "hello.txt").allowed, true);
  assertEquals(verifyGovernance("read", "sub/file.ts").allowed, true);
});

Deno.test("verifyGovernance rejects path escape", () => {
  const r = verifyGovernance("read", "../other");
  assertEquals(r.allowed, false);
  if (!r.allowed) {
    assertEquals(r.reason, "Path must be under shared/runtime/store/");
  }
});
