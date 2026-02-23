/**
 * Knowledge store tests. Require PostgreSQL with schema 05_knowledge applied
 * (knowledge_node, knowledge_edge). Skip when DATABASE_URL/PGHOST unset.
 */

import { assertEquals } from "@std/assert";
import {
  getEdge,
  getNode,
  listEdges,
  listNodes,
  putEdge,
  putNode,
} from "#system/content/knowledge.store.ts";

function hasPgEnv(): boolean {
  return (
    Deno.env.get("DATABASE_URL") !== undefined ||
    Deno.env.get("PGHOST") !== undefined
  );
}

const testNodeId = `kg-node-${Date.now()}`;
const testNodeId2 = `kg-node-${Date.now()}-2`;

Deno.test({
  name: "getNode(id) returns null for missing id",
  ignore: !hasPgEnv(),
  async fn() {
    const out = await getNode("non-existent-node-id-xyz");
    assertEquals(out, null);
  },
});

Deno.test({
  name: "putNode then getNode returns same node",
  ignore: !hasPgEnv(),
  async fn() {
    const node = {
      id: testNodeId,
      type: "concept",
      payload: { label: "past tense" },
      created_at: "2025-01-01T00:00:00Z",
    };
    await putNode(node);
    const got = await getNode(testNodeId);
    assertEquals(got != null, true);
    assertEquals(got!.id, node.id);
    assertEquals(got!.type, node.type);
    assertEquals(got!.payload, node.payload);
    assertEquals(got!.created_at, node.created_at);
  },
});

Deno.test({
  name: "listNodes returns nodes; type and limit filters work",
  ignore: !hasPgEnv(),
  async fn() {
    await putNode({
      id: testNodeId2,
      type: "concept",
      payload: {},
    });
    const all = await listNodes();
    assertEquals(Array.isArray(all), true);
    const ids = all.map((n) => n.id);
    assertEquals(ids.includes(testNodeId), true);
    assertEquals(ids.includes(testNodeId2), true);
    const limited = await listNodes({ limit: 1 });
    assertEquals(limited.length, 1);
    const byType = await listNodes({ type: "concept" });
    assertEquals(byType.every((n) => n.type === "concept"), true);
  },
});

Deno.test({
  name: "getEdge returns null for missing edge; putEdge then getEdge returns edge",
  ignore: !hasPgEnv(),
  async fn() {
    const missing = await getEdge("n1", "n2", "relates");
    assertEquals(missing, null);
    await putEdge({
      from_id: testNodeId,
      to_id: testNodeId2,
      type: "relates",
      payload: { weight: 1 },
    });
    const got = await getEdge(testNodeId, testNodeId2, "relates");
    assertEquals(got != null, true);
    assertEquals(got!.from_id, testNodeId);
    assertEquals(got!.to_id, testNodeId2);
    assertEquals(got!.type, "relates");
    assertEquals((got!.payload as { weight?: number })?.weight, 1);
  },
});

Deno.test({
  name: "listEdges with fromId/toId/type filters",
  ignore: !hasPgEnv(),
  async fn() {
    const list = await listEdges({ fromId: testNodeId });
    assertEquals(Array.isArray(list), true);
    assertEquals(list.some((e) => e.to_id === testNodeId2 && e.type === "relates"), true);
    const byType = await listEdges({ type: "relates" });
    assertEquals(byType.every((e) => e.type === "relates"), true);
  },
});
