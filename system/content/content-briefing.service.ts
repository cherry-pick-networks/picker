/**
 * Briefing prompt: aggregate submissions, grading, and profiles into a
 * single prompt string for 10-minute briefing (or LLM input).
 */

import type {
  BuildBriefingRequest,
  BuildBriefingResponse,
} from "./content.schema.ts";
import { buildBriefingContext } from "./content-briefing-context.service.ts";
import { loadBriefingTemplate } from "./content-prompt-load.service.ts";

export type { BriefingContext } from "./content-briefing-context.service.ts";
export { buildBriefingContext } from "./content-briefing-context.service.ts";

// function-length-ignore
export async function buildBriefingPrompt(
  request: BuildBriefingRequest,
): Promise<BuildBriefingResponse | null> {
  const ctx = await buildBriefingContext(
    request.worksheet_id,
    request.student_ids,
  );
  if (ctx == null) return null;
  const mainTpl = await loadBriefingTemplate();
  const studentFeedbackBlocks = ctx.blocks.length > 0
    ? ctx.blocks.join("\n\n")
    : "No submissions.";
  const prompt = mainTpl
    .replace("{{session_id}}", ctx.sessionId)
    .replace("{{date_iso}}", ctx.dateIso)
    .replace("{{sheet_label}}", ctx.sheetLabel)
    .replace("{{student_feedback_blocks}}", studentFeedbackBlocks);
  return { prompt };
}
