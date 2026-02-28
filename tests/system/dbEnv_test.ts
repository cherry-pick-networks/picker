/**
 * Test helper: hasDbEnv() true when DB is configured (DATABASE_URL or
 * PG_PASSWORD). Use with Deno.test(..., { ignore: !hasDbEnv() }) for
 * DB-dependent tests. Other test files import from this file.
 */
export function hasDbEnv(): boolean {
  const url = Deno.env.get('DATABASE_URL');
  const pw = Deno.env.get('PG_PASSWORD');
  return !!(url ?? pw);
}

Deno.test('hasDbEnv true when DATABASE_URL set', () => {
  Deno.env.set('DATABASE_URL', 'postgres://x');
  try {
    if (!hasDbEnv()) throw new Error('expected true');
  } finally {
    Deno.env.delete('DATABASE_URL');
  }
});
