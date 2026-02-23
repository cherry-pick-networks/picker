/**
 * Verify getPg() connects when DATABASE_URL or PGHOST is set. Skip otherwise.
 */

import { assertEquals } from "@std/assert";
import { getPg } from "#shared/infra/pg.client.ts";

function hasPgEnv(): boolean {
  return (
    Deno.env.get("DATABASE_URL") !== undefined ||
    Deno.env.get("PGHOST") !== undefined
  );
}

Deno.test({
  name: "getPg() returns client and SELECT 1 succeeds when PG env is set",
  ignore: !hasPgEnv(),
  async fn() {
    const sql = await getPg();
    const result = await sql.queryArray("SELECT 1 AS n");
    assertEquals(result.rows.length, 1);
    assertEquals((result.rows[0] as [number])[0], 1);
  },
});
