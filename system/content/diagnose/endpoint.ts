import type { Context } from 'hono';
import { DiagnoseRequestSchema } from './schema.ts';
import { runMisconceptionDiagnosis } from './service.ts';

export async function postDiagnoseMisconception(
  c: Context,
) {
  const parsed = DiagnoseRequestSchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await runMisconceptionDiagnosis(
    parsed.data,
  );
  return result.ok ? c.json(result.response) : c.json(
    { ok: false, message: result.message },
    result.status,
  );
}
