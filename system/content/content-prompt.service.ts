import type { CreateResult } from "#shared/infra/result.types.ts";
import { getProfile } from "#system/actor/profile.service.ts";
import type {
  GenerateWorksheetRequest,
  WorksheetPromptResponse,
} from "./content.schema.ts";
import {
  getContextForRequest,
  substitutePrompt,
} from "./content-prompt-format.service.ts";

export type { WorksheetContext } from "./content-prompt-format.service.ts";
import { loadTemplateAndFormat } from "./content-prompt-load.service.ts";

type NextSessionPlan = {
  question_type?: string;
  item_count?: number;
  time_limit_minutes?: number;
  structural_notes_override?: string;
  constraint_notes?: string;
};

// function-length-ignore
async function mergeNextSessionPlanIntoRequest(
  request: GenerateWorksheetRequest,
): Promise<GenerateWorksheetRequest> {
  if (!request.student_id) return request;
  const profile = await getProfile(request.student_id);
  const plan = profile?.preferences?.next_session_plan as
    | NextSessionPlan
    | undefined;
  if (!plan || typeof plan !== "object") return request;
  const merged = { ...request };
  if (plan.question_type !== undefined) {
    merged.question_type = plan.question_type;
  }
  if (plan.item_count !== undefined) merged.item_count = plan.item_count;
  return merged;
}

const ERROR_BUILD_PROMPT_FAILED = "Build prompt failed";

// function-length-ignore
export async function buildWorksheetPrompt(
  request: GenerateWorksheetRequest,
): Promise<CreateResult<WorksheetPromptResponse>> {
  try {
    const ctx = await getContextForRequest(request);
    let ctxFinal = ctx;
    if (request.student_id) {
      const profile = await getProfile(request.student_id);
      const plan = profile?.preferences?.next_session_plan as
        | NextSessionPlan
        | undefined;
      if (plan?.structural_notes_override !== undefined) {
        ctxFinal = { ...ctx, structural_notes: plan.structural_notes_override };
      }
    }
    const requestWithPlan = await mergeNextSessionPlanIntoRequest(request);
    const qt = (requestWithPlan.question_type ?? "").trim().toLowerCase();
    const { template, formatBlock } = await loadTemplateAndFormat(qt);
    const data = {
      prompt: substitutePrompt(
        template,
        ctxFinal,
        requestWithPlan,
        formatBlock,
        "",
        "",
      ),
    };
    return { ok: true, data };
  } catch {
    return { ok: false, error: ERROR_BUILD_PROMPT_FAILED, status: 500 };
  }
}
