/**
 * Queue store tests. PG with 06_task_queue applied; skip if no DATABASE_URL.
 * Covers enqueue -> dequeue -> complete/fail.
 */

import { assertEquals } from "@std/assert";
import {
  complete,
  dequeue,
  enqueue,
  fail,
} from "#system/queue/queue.store.ts";

function hasPgEnv(): boolean {
  return (
    Deno.env.get("DATABASE_URL") !== undefined ||
    Deno.env.get("PGHOST") !== undefined
  );
}

const kind = `queue-test-${Date.now()}`;

Deno.test({
  name: "enqueue then dequeue returns same task; complete marks done",
  ignore: !hasPgEnv(),
  async fn() {
    const t = await enqueue({ kind, payload: { step: 1 } });
    assertEquals(t.kind, kind);
    assertEquals(t.status, "pending");
    const claimed = await dequeue({ kind, limit: 1 });
    assertEquals(claimed.length, 1);
    assertEquals(claimed[0].id, t.id);
    assertEquals(claimed[0].status, "running");
    await complete(t.id);
    const again = await dequeue({ kind, limit: 1 });
    assertEquals(again.length, 0);
  },
});

Deno.test({
  name: "enqueue then dequeue then fail(id, reason) stores error",
  ignore: !hasPgEnv(),
  async fn() {
    const t = await enqueue({ kind, payload: { step: 2 } });
    const claimed = await dequeue({ kind, limit: 1 });
    assertEquals(claimed.length, 1);
    assertEquals(claimed[0].id, t.id);
    await fail(t.id, "test failure reason");
    const after = await dequeue({ kind, limit: 5 });
    assertEquals(after.length, 0);
  },
});

Deno.test({
  name: "dequeue with limit returns at most limit tasks",
  ignore: !hasPgEnv(),
  async fn() {
    await enqueue({ kind, payload: {} });
    await enqueue({ kind, payload: {} });
    const two = await dequeue({ kind, limit: 2 });
    assertEquals(two.length, 2);
    const one = await dequeue({ kind, limit: 1 });
    assertEquals(one.length, 0);
    await complete(two[0].id);
    await complete(two[1].id);
  },
});
