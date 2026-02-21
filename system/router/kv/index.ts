import { z } from "zod";
import { getKv, listKeys } from "../../store/kv.ts";

const KvBodySchema = z.object({ key: z.string(), value: z.unknown() });

function keysResponse(keys: string[]): Response {
  const headers = { "Content-Type": "application/json" };
  return new Response(JSON.stringify({ keys }), { headers });
}

export const handler = {
  async GET(req: Request) {
    const prefix = new URL(req.url).searchParams.get("prefix") ?? undefined;
    return keysResponse(await listKeys(prefix));
  },
  // deno-lint-ignore function-length/function-length
  async POST(req: Request) {
    const body = await req.json();
    const parsed = KvBodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const kv = await getKv();
    await kv.set(["kv", parsed.data.key], parsed.data.value);
    return new Response(JSON.stringify({ key: parsed.data.key }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
