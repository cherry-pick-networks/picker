/**
 * Build briefing context (worksheet + blocks per student). Used by
 * content-briefing.service buildBriefingPrompt.
 */

import { getProfile } from "#system/actor/profile.service.ts";
import type { ItemResult, Worksheet } from "./content.schema.ts";
import { getItemsForWorksheet, getWorksheet } from "./content.service.ts";
import {
  gradeSubmission,
  listSubmissions,
} from "./content-submission.service.ts";
import { loadBriefingBlockTemplate } from "./content-prompt-load.service.ts";

export type BriefingContext = {
  worksheet: Worksheet;
  sessionId: string;
  dateIso: string;
  sheetLabel: string;
  blocks: string[];
};

function wrongItemsSummary(results: ItemResult[]): string {
  const wrong = results.filter((r) => !r.is_correct);
  if (wrong.length === 0) return "None";
  return wrong
    .map(
      (r) =>
        `${r.item_id}: chose "${r.chosen_text ?? r.chosen}" → correct "${
          r.correct_text ?? r.correct_index
        }"`,
    )
    .join("; ");
}

// function-length-ignore
function substituteBlock(
  template: string,
  ctx: {
    student_name: string;
    score: string;
    gimmick: string;
    wrong_items_summary: string;
  },
): string {
  return template
    .replace("{{student_name}}", ctx.student_name)
    .replace("{{score}}", ctx.score)
    .replace("{{gimmick}}", ctx.gimmick)
    .replace("{{wrong_items_summary}}", ctx.wrong_items_summary);
}

// function-length-ignore
export async function buildBriefingContext(
  worksheetId: string,
  studentIds?: string[],
): Promise<BriefingContext | null> {
  const worksheet = await getWorksheet(worksheetId);
  if (worksheet == null) return null;
  const items = await getItemsForWorksheet(worksheetId);
  let submissions = await listSubmissions(worksheetId);
  if (studentIds != null && studentIds.length > 0) {
    const set = new Set(studentIds);
    submissions = submissions.filter((s) => set.has(s.student_id));
  }
  const blockTpl = await loadBriefingBlockTemplate();
  const blocks: string[] = [];
  for (const sub of submissions) {
    const grading = gradeSubmission(sub, items);
    const profile = await getProfile(sub.student_id);
    const gimmick = (profile?.preferences?.gimmick as string) ?? "";
    const scoreStr = items.length > 0
      ? `${grading.correct}/${grading.total} (${
        Math.round(grading.score * 100)
      }%)`
      : "0/0";
    const wrongSummary = wrongItemsSummary(grading.results);
    const block = substituteBlock(blockTpl, {
      student_name: sub.student_id,
      score: scoreStr,
      gimmick,
      wrong_items_summary: wrongSummary,
    });
    blocks.push(block);
  }
  const sessionId = (worksheet.metadata?.session_id as string) ??
    worksheet.worksheet_id;
  const dateIso =
    (worksheet.generated_at ?? worksheet.metadata?.date_iso as string) ?? "";
  const sheetLabel = worksheet.title ?? worksheet.worksheet_id;
  return {
    worksheet,
    sessionId,
    dateIso,
    sheetLabel,
    blocks,
  };
}
