import { listScripts } from "../../store/scripts.ts";

function jsonResponse(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const handler = {
  async GET() {
    const result = await listScripts();
    if (!result.ok) {
      return jsonResponse({ error: result.body }, result.status);
    }
    return jsonResponse({ entries: result.entries }, 200);
  },
};
