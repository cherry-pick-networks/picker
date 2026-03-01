//  GET /content/recommendations: unified entry (intent → semantic | rag | semantic_items).

import type { Context } from 'hono';
import { getRecommendations } from './recommendationsService.ts';
import { RecommendationsQuerySchema } from './recommendationsSchema.ts';

function tryParseContext(
  contextRaw: string | null,
): Record<string, unknown> | undefined {
  if (!contextRaw) return undefined;
  try {
    return JSON.parse(contextRaw) as Record<
      string,
      unknown
    >;
  } catch {
    return { query: contextRaw };
  }
}

function normalizeContext(
  contextRaw: string | null,
  queryParam: string | null,
): Record<string, unknown> | undefined {
  const context = tryParseContext(contextRaw);
  if (queryParam != null && context == null) {
    return { query: queryParam };
  }
  if (
    queryParam != null && context != null &&
    context['query'] == null
  ) {
    return { ...context, query: queryParam };
  }
  return context;
}

function parseQuery(c: Context): unknown {
  const url = new URL(c.req.url);
  const p = url.searchParams;
  const context = normalizeContext(
    p.get('context'),
    p.get('query'),
  );
  return {
    actor_id: p.get('actor_id') ?? '',
    intent: p.get('intent') ?? undefined,
    limit: p.get('limit') != null
      ? Number(p.get('limit'))
      : undefined,
    scheme_id: p.get('scheme_id') ?? undefined,
    context,
  };
}

export async function getContentRecommendations(
  c: Context,
): Promise<Response> {
  const parsed = RecommendationsQuerySchema.safeParse(
    parseQuery(c),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await getRecommendations(parsed.data);
  return result.ok
    ? c.json({ recommendations: result.recommendations })
    : c.json({ error: result.message }, result.status);
}
