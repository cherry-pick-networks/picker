import { readScript, writeScript } from "../../store/scripts.ts";

type Ctx = { params: Record<string, string> };

function jsonError(body: string, status: number): Response {
  return new Response(JSON.stringify({ error: body }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const handler = {
  async GET(_req: Request, ctx: Ctx) {
    const path = ctx.params.path ?? "";
    const result = await readScript(path);
    if (!result.ok) {
      return jsonError(result.body, result.status);
    }
    return new Response(result.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
  async POST(req: Request, ctx: Ctx) {
    const path = ctx.params.path ?? "";
    if (!path.trim()) {
      return jsonError("path required", 400);
    }
    const content = await req.text();
    const result = await writeScript(path, content);
    if (!result.ok) {
      return jsonError(result.body, result.status);
    }
    return new Response(null, { status: 201 });
  },
};
