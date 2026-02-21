import { z } from "zod";
import { getKv, listKeys } from "../../store/kv.ts";

const KvBodySchema = z.object({ key: z.string(), value: z.unknown() });

export const handler = {
  async GET(req: Request) {
    const url = new URL(req.url);
    const prefix = url.searchParams.get("prefix") ?? undefined;
    const keys = await listKeys(prefix);
    return new Response(JSON.stringify({ keys }), {
      headers: { "Content-Type": "application/json" },
    });
  },
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
