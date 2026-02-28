import * as contentStore from "./content.store.ts";
import type { CreateWorksheetRequest, Worksheet } from "./content.schema.ts";
import { nowIso } from "./content-schema-parse.service.ts";

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
