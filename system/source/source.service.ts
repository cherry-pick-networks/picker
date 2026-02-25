import * as sourceSchema from "./source.schema.ts";
import * as sourceStore from "./source.store.ts";

const { SourceSchema } = sourceSchema;
export type { CreateSourceRequest, Source } from "./source.schema.ts";
export { CreateSourceRequestSchema, SourceSchema } from "./source.schema.ts";

function nowIso(): string {
  const s = new Date().toISOString();
  return s;
}

function parseSource(raw: unknown): sourceSchema.Source {
  const parsed = SourceSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid source");
  return parsed.data;
}

export async function getSource(
  id: string,
): Promise<sourceSchema.Source | null> {
  const raw = await sourceStore.getSource(id);
  if (raw == null) return null;
  const parsed = SourceSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function buildSourceRaw(
  body: sourceSchema.CreateSourceRequest,
): sourceSchema.Source {
  const id = body.source_id ?? crypto.randomUUID();
  const collected_at = body.collected_at ?? nowIso();
  return parseSource({
    ...body,
    source_id: id,
    collected_at,
  });
}

export async function createSource(
  body: sourceSchema.CreateSourceRequest,
): Promise<sourceSchema.Source> {
  const source = buildSourceRaw(body);
  await sourceStore.setSource(
    source as unknown as Record<string, unknown>,
  );
  return source;
}

export async function listSources(): Promise<sourceSchema.Source[]> {
  const rawList = await sourceStore.listSources();
  const out: sourceSchema.Source[] = [];
  for (const raw of rawList) {
    const parsed = SourceSchema.safeParse(raw);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
