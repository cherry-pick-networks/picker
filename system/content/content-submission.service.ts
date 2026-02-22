/** Submission CRUD and grading. Uses content.store for submission KV. */

import * as contentStore from "./content.store.ts";
import type {
  CreateSubmissionRequest as CreateSubmissionRequestType,
  Item,
  Submission,
} from "./content.schema.ts";
import {
  ItemSchema,
  SubmissionSchema,
  WorksheetSchema,
} from "./content.schema.ts";
import { nowIso } from "./content-parse.service.ts";
export { gradeSubmission } from "./content-submission-grading.service.ts";

// function-length-ignore
export async function getItemsForWorksheet(
  worksheetId: string,
): Promise<Item[]> {
  const raw = await contentStore.getWorksheet(worksheetId);
  if (raw == null) return [];
  const ws = WorksheetSchema.safeParse(raw);
  if (!ws.success) return [];
  const out: Item[] = [];
  for (const id of ws.data.item_ids) {
    const r = await contentStore.getItem(id);
    if (r == null) continue;
    const item = ItemSchema.safeParse(r);
    if (item.success) out.push(item.data);
  }
  return out;
}

function buildSubmissionRaw(body: CreateSubmissionRequestType): Submission {
  const submission_id = body.submission_id ?? crypto.randomUUID();
  const submitted_at = nowIso();
  return {
    submission_id,
    worksheet_id: body.worksheet_id,
    student_id: body.student_id,
    answers: body.answers,
    submitted_at,
  };
}

export async function createSubmission(
  body: CreateSubmissionRequestType,
): Promise<Submission> {
  const sub = buildSubmissionRaw(body);
  await contentStore.setSubmission(
    sub as unknown as Record<string, unknown>,
  );
  return sub;
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const raw = await contentStore.getSubmission(id);
  if (raw == null) return null;
  const parsed = SubmissionSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseSubmissionRaw(
  r: Record<string, unknown>,
): Submission | null {
  const p = SubmissionSchema.safeParse(r);
  return p.success ? p.data : null;
}

export async function listSubmissions(
  worksheetId?: string,
): Promise<Submission[]> {
  const rawList = await contentStore.listSubmissions();
  const list = rawList
    .map(parseSubmissionRaw)
    .filter((s): s is Submission => s != null);
  if (worksheetId == null) return list;
  return list.filter((s) => s.worksheet_id === worksheetId);
}
