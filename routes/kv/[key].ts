import { getKv } from "../../lib/kv.ts";

export const handler = {
  async GET(_req, ctx) {
    const kv = await getKv();
    const key = ctx.params.key;
    const entry = await kv.get(["kv", key]);
    return new Response(JSON.stringify(entry.value ?? null), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
