import { deleteKey, getKv } from "../../store/kv.ts";

// deno-lint-ignore function-length/function-length
function getValueJson(kv: Deno.Kv, key: string): Promise<Response> {
  const h = { "Content-Type": "application/json" };
  return kv.get(["kv", key]).then((e) =>
    new Response(JSON.stringify(e.value ?? null), { headers: h })
  );
}

export const handler = {
  async GET(_req: Request, ctx: { params: Record<string, string> }) {
    const kv = await getKv();
    return getValueJson(kv, ctx.params.key);
  },
  async DELETE(_req: Request, ctx: { params: Record<string, string> }) {
    await deleteKey(ctx.params.key);
    return new Response(null, { status: 204 });
  },
};
