import {
  allowlistHas,
  type FacetName,
} from '#api/config/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import * as sourceSchema from './materialSourceSchema.ts';
import { ContentStores } from '#api/storage/ContentStores.ts';

const { SourceSchema } = sourceSchema;
export type {
  CreateSourceRequest,
  Source,
} from './materialSourceSchema.ts';
export {
  CreateSourceRequestSchema,
  SourceSchema,
} from './materialSourceSchema.ts';

function nowIso(): string {
  const s = new Date().toISOString();
  return s;
}

function parseSource(raw: unknown): sourceSchema.Source {
  const parsed = SourceSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Invalid source');
  return parsed.data;
}

export async function getSource(
  id: string,
): Promise<sourceSchema.Source | null> {
  const raw = await ContentStores.sourceStore.getSource(id);
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
  if (body.type != null && body.type !== '') {
    const data = await getAllowlistDataOrLoad();
    if (
      !allowlistHas(
        data,
        'contentType' as FacetName,
        body.type,
      )
    ) {
      const msg = 'Invalid document_type: ' + body.type +
        '. Must be a valid Schema.org or BibTeX code.';
      throw new Error(msg);
    }
  }
  const source = buildSourceRaw(body);
  await ContentStores.sourceStore.setSource(
    source as unknown as Record<string, unknown>,
  );
  return source;
}

export async function listSources(): Promise<
  sourceSchema.Source[]
> {
  const rawList = await ContentStores.sourceStore
    .listSources();
  const out: sourceSchema.Source[] = [];
  for (const raw of rawList) {
    const parsed = SourceSchema.safeParse(raw);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}
