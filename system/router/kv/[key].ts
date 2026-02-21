import { deleteKey, getKv } from "../../store/kv.ts";

export const handler = {
  async GET(_req: Request, ctx: { params: Record<string, string> }) {
    const kv = await getKv();
    const key = ctx.params.key;
    const entry = await kv.get(["kv", key]);
    return new Response(JSON.stringify(entry.value ?? null), {
      headers: { "Content-Type": "application/json" },
    });
  },
  async DELETE(_req: Request, ctx: { params: Record<string, string> }) {
    const key = ctx.params.key;
    await deleteKey(key);
    return new Response(null, { status: 204 });
  },
};
