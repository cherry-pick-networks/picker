/**
 * Content storage in PostgreSQL. Tables: content_item, content_worksheet,
 * content_submission (payload JSONB, updated_at).
 */

import { getPg } from "#shared/infra/pg.client.ts";
import { selectItemsByConcept } from "./content-store.helpers.ts";
import { nowIso } from "./content-parse.service.ts";

const SQL_ITEM_GET = "SELECT payload FROM content_item WHERE item_id = $1";
const SQL_ITEM_UPSERT =
  "INSERT INTO content_item (item_id, concept_id, payload, updated_at) " +
  "VALUES ($1, $2, $3, $4) " +
  "ON CONFLICT (item_id) DO UPDATE SET concept_id = EXCLUDED.concept_id, " +
  "payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at";
const SQL_WORKSHEET_GET =
  "SELECT payload FROM content_worksheet WHERE worksheet_id = $1";
const SQL_WORKSHEET_UPSERT =
  "INSERT INTO content_worksheet (worksheet_id, payload, updated_at) " +
  "VALUES ($1, $2, $3) " +
  "ON CONFLICT (worksheet_id) DO UPDATE SET payload = EXCLUDED.payload, " +
  "updated_at = EXCLUDED.updated_at";
const SQL_SUBMISSION_GET =
  "SELECT payload FROM content_submission WHERE submission_id = $1";
const SQL_SUBMISSION_UPSERT =
  "INSERT INTO content_submission (submission_id, payload, updated_at) " +
  "VALUES ($1, $2, $3) " +
  "ON CONFLICT (submission_id) DO UPDATE SET payload = EXCLUDED.payload, " +
  "updated_at = EXCLUDED.updated_at";
const SQL_SUBMISSIONS_LIST =
  "SELECT payload FROM content_submission ORDER BY submission_id";

function itemUpsertArgs(
  value: Record<string, unknown>,
): [string, string | null, string, string] | null {
  const id = value.item_id as string;
  if (!id) return null;
  const conceptId = (value.concept_id as string) ?? null;
  return [id, conceptId, JSON.stringify(value), nowIso()];
}

export async function getItem(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(SQL_ITEM_GET, [
    id,
  ]);
  if (rows.length === 0) return null;
  return rows[0].payload ?? null;
}

export async function setItem(value: Record<string, unknown>): Promise<void> {
  const args = itemUpsertArgs(value);
  if (!args) throw new Error("item_id required");
  const sql = await getPg();
  await sql.queryObject(SQL_ITEM_UPSERT, args);
}

export async function listItemsByConcept(
  conceptId: string,
): Promise<Record<string, unknown>[]> {
  const sql = await getPg();
  return selectItemsByConcept(sql, conceptId);
}

export async function getWorksheet(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(
    SQL_WORKSHEET_GET,
    [id],
  );
  if (rows.length === 0) return null;
  return rows[0].payload ?? null;
}

export async function setWorksheet(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.worksheet_id as string;
  if (!id) throw new Error("worksheet_id required");
  const sql = await getPg();
  await sql.queryObject(SQL_WORKSHEET_UPSERT, [
    id,
    JSON.stringify(value),
    nowIso(),
  ]);
}

export async function getSubmission(id: string): Promise<unknown | null> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(
    SQL_SUBMISSION_GET,
    [id],
  );
  if (rows.length === 0) return null;
  return rows[0].payload ?? null;
}

export async function setSubmission(
  value: Record<string, unknown>,
): Promise<void> {
  const id = value.submission_id as string;
  if (!id) throw new Error("submission_id required");
  const sql = await getPg();
  await sql.queryObject(SQL_SUBMISSION_UPSERT, [
    id,
    JSON.stringify(value),
    nowIso(),
  ]);
}

export async function listSubmissions(): Promise<Record<string, unknown>[]> {
  const sql = await getPg();
  const { rows } = await sql.queryObject<{ payload: unknown }>(
    SQL_SUBMISSIONS_LIST,
  );
  return rows
    .map((r) => r.payload as Record<string, unknown> | null)
    .filter((v): v is Record<string, unknown> => v != null);
}
