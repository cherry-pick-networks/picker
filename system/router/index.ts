function okJson(): Response {
  const headers = { "Content-Type": "application/json" };
  return new Response(JSON.stringify({ ok: true }), { headers });
}

export const handler = {
  GET() {
    return okJson();
  },
};
