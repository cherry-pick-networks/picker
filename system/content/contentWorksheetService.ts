import * as contentStore from './contentStore.ts';
import type { CreateWorksheetRequest, Worksheet } from './contentSchema.ts';
import { nowIso } from './contentSchemaParseService.ts';

async function saveWorksheet(worksheet: Worksheet): Promise<Worksheet> {
  await contentStore.setWorksheet(
    worksheet as unknown as Record<string, unknown>,
  );
  return worksheet;
}

export function createWorksheet(
  request: CreateWorksheetRequest,
): Promise<Worksheet> {
  const worksheet_id = crypto.randomUUID();
  const title = request.title ?? `Worksheet ${worksheet_id.slice(0, 8)}`;
  const worksheet: Worksheet = {
    worksheet_id,
    title,
    item_ids: request.item_ids,
    generated_at: nowIso(),
    metadata: {},
  };
  return saveWorksheet(worksheet);
}
