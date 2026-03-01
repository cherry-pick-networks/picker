//
// Lexis integration: utterance → parse → GET /lexis/entries → 200 + entries.
// Requires DB (seed lexis source + entries). Skipped when no DATABASE_URL.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { LexisEntrySchema } from '#api/search/material/lexisSchema.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const dbOpts = () => ({
  sanitizeResources: false,
  ignore: !hasDbEnv(),
});

function url(
  path: string,
  q?: Record<string, string>,
): string {
  const u = new URL(path, 'http://localhost');
  if (q) {
    for (const [k, v] of Object.entries(q)) {
      u.searchParams.set(k, v);
    }
  }
  return u.toString();
}

Deno.test(
  'GET /lexis/entries?source_id&days returns 200 and entries array',
  dbOpts(),
  async () => {
    const res = await handler(
      new Request(
        url('/lexis/entries', {
          source_id: 'lexis-middle-intermediate',
          days: '1',
        }),
      ),
    );
    assertEquals(res.status, 200);
    const body = (await res.json()) as {
      entries: unknown[];
    };
    assertEquals(Array.isArray(body.entries), true);
    for (const e of body.entries) {
      LexisEntrySchema.parse(e);
    }
  },
);

Deno.test(
  'GET /lexis/entries?q= (regex path) returns 200 and entries array',
  dbOpts(),
  async () => {
    const res = await handler(
      new Request(
        url('/lexis/entries', {
          q: '워드마스터 중등 실력 1일차',
        }),
      ),
    );
    assertEquals(res.status, 200);
    const body = (await res.json()) as {
      entries: unknown[];
    };
    assertEquals(Array.isArray(body.entries), true);
  },
);

Deno.test(
  'GET /lexis/entries?q= (LLM mock fallback) returns 200',
  dbOpts(),
  async () => {
    Deno.env.set('LEXIS_UTTERANCE_LLM_MOCK', '1');
    try {
      const res = await handler(
        new Request(
          url('/lexis/entries', { q: '그 책 1일차만' }),
        ),
      );
      assertEquals(res.status, 200);
      const body = (await res.json()) as {
        entries: unknown[];
      };
      assertEquals(Array.isArray(body.entries), true);
    } finally {
      Deno.env.delete('LEXIS_UTTERANCE_LLM_MOCK');
    }
  },
);

Deno.test(
  'GET /lexis/entries?q= (parse failure) returns 400',
  dbOpts(),
  async () => {
    const hadKey = Deno.env.get('OPENAI_API_KEY');
    Deno.env.delete('OPENAI_API_KEY');
    Deno.env.delete('LEXIS_UTTERANCE_LLM_MOCK');
    try {
      const res = await handler(
        new Request(
          url('/lexis/entries', { q: '그 책 1일차만' }),
        ),
      );
      assertEquals(res.status, 400);
      const body = (await res.json()) as { error?: string };
      assertEquals(body.error, 'parse_error');
    } finally {
      if (hadKey !== undefined) {
        Deno.env.set('OPENAI_API_KEY', hadKey);
      }
    }
  },
);
