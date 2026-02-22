import { z } from "zod";
import * as sourceStore from "../store/source.ts";

export const SourceSchema = z.object({
  source_id: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
  collected_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const CreateSourceRequestSchema = SourceSchema.omit({
  source_id: true,
  collected_at: true,
}).extend({
  source_id: z.string().optional(),
  collected_at: z.string().optional(),
});
export type CreateSourceRequest = z.infer<typeof CreateSourceRequestSchema>;

// deno-lint-ignore function-length/function-length
function nowIso(): string {
  return new Date().toISOString();
}

function parseSource(raw: unknown): Source {
  const parsed = SourceSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid source");
  return parsed.data;
}

export async function getSource(id: string): Promise<Source | null> {
  const raw = await sourceStore.getSource(id);
  if (raw == null) return null;
  const parsed = SourceSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function buildSourceRaw(body: CreateSourceRequest): Source {
  const id = body.source_id ?? crypto.randomUUID();
  const collected_at = body.collected_at ?? nowIso();
  return parseSource({
    ...body,
    source_id: id,
    collected_at,
  });
}

export async function createSource(
  body: CreateSourceRequest,
): Promise<Source> {
  const source = buildSourceRaw(body);
  await sourceStore.setSource(
    source as unknown as Record<string, unknown>,
  );
  return source;
}

export async function listSources(): Promise<Source[]> {
  const rawList = await sourceStore.listSources();
  const out: Source[] = [];
  for (const raw of rawList) {
    const parsed = SourceSchema.safeParse(raw);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
