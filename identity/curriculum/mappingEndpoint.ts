//  HTTP endpoint for external curriculum mapping (LLM, one call).

import type { Context } from 'hono';
import { produceMapping } from './mappingService.ts';
import {
  ExternalMappingRequestSchema,
  toCopilotMappings,
} from './mappingSchema.ts';

export async function postExternalMapping(c: Context) {
  const parsed = ExternalMappingRequestSchema.safeParse(
    await c.req.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const result = await produceMapping({
    level: parsed.data.level,
    national_standard: parsed.data.national_standard,
    save_to_file: parsed.data.save_to_file,
  });
  return result.ok
    ? c.json({
      mappings: toCopilotMappings(result.mapping),
      ...(result.saved != null && { saved: result.saved }),
    })
    : c.json(
      { ok: false, message: result.message },
      result.status,
    );
}
