import { z } from "zod";
import { getKv, listKeys } from "../../store/kv.ts";

const KvBodySchema = z.object({ key: z.string(), value: z.unknown() });

function keysResponse(keys: string[]): Response {
  const headers = { "Content-Type": "application/json" };
  return new Response(JSON.stringify({ keys }), { headers });
}

function validationErrorResponse(flattened: unknown): Response {
  const headers = { "Content-Type": "application/json" };
  return new Response(JSON.stringify({ error: flattened }), {
    status: 400,
    headers,
  });
}

function parseKvBody(
  body: unknown,
): { ok: true; data: { key: string; value: unknown } } | {
  ok: false;
  errorResponse: Response;
} {
  const parsed = KvBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      errorResponse: validationErrorResponse(parsed.error.flatten()),
    };
  }
  return { ok: true, data: parsed.data };
}

async function writeKv(key: string, value: unknown): Promise<void> {
  const kv = await getKv();
  await kv.set(["kv", key], value);
}

function createdResponse(key: string): Response {
  const headers = { "Content-Type": "application/json" };
  return new Response(JSON.stringify({ key }), { headers });
}

export const handler = {
  async GET(req: Request) {
    const prefix = new URL(req.url).searchParams.get("prefix") ?? undefined;
    return keysResponse(await listKeys(prefix));
  },
  async POST(req: Request) {
    const parsed = parseKvBody(await req.json());
    if (!parsed.ok) return parsed.errorResponse;
    await writeKv(parsed.data.key, parsed.data.value);
    return createdResponse(parsed.data.key);
  },
};
