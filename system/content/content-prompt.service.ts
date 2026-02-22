import type {
  GenerateWorksheetRequest,
  WorksheetPromptResponse,
} from "./content.schema.ts";
import {
  DEFAULT_QUESTION_TYPE,
  DEFAULT_WORKSHEET_CONTEXT,
  type WorksheetContext,
} from "./content-prompt.types.ts";

export type { WorksheetContext };
import { getProfile } from "#system/actor/profile.service.ts";
import {
  DEFAULT_GOAL_ACCURACY,
  DEFAULT_VOCABULARY,
  loadTemplateAndFormat,
} from "./content-prompt-load.service.ts";

export function contextFromProfile(profile: {
  id: string;
  preferences?: Record<string, unknown>;
}): WorksheetContext {
  const wg = (profile.preferences?.worksheet_generation ?? {}) as Record<
    string,
    unknown
  >;
  const goal = wg.goal_accuracy as number | undefined;
  const goalStr = goal != null
    ? `${Math.round(goal * 100)}%`
    : DEFAULT_GOAL_ACCURACY;
  return {
    student_name: profile.id,
    goal_accuracy: goalStr,
    structural_notes: (wg.structural_notes as string) ?? "",
    vocabulary_policy: (wg.vocabulary_policy as string) ?? DEFAULT_VOCABULARY,
    distractor_policy: (wg.distractor_policy as string) ??
      DEFAULT_WORKSHEET_CONTEXT.distractor_policy,
  };
}

export function substitutePrompt(
  template: string,
  ctx: WorksheetContext,
  request: GenerateWorksheetRequest,
  formatBlock: string,
  mainTheme = "",
  actionPlan = "",
): string {
  const out = template
    .replace("{{student_name}}", ctx.student_name || "Unknown")
    .replace("{{goal_accuracy}}", ctx.goal_accuracy)
    .replace("{{structural_notes}}", ctx.structural_notes)
    .replace(
      "{{question_type}}",
      request.question_type?.trim() || DEFAULT_QUESTION_TYPE,
    )
    .replace("{{item_count}}", String(request.item_count ?? 5))
    .replace("{{concept_ids}}", (request.concept_ids ?? []).join(", "))
    .replace("{{vocabulary_policy}}", ctx.vocabulary_policy)
    .replace("{{distractor_policy}}", ctx.distractor_policy)
    .replace("{{output_format}}", formatBlock)
    .replace("{{main_theme}}", mainTheme)
    .replace("{{action_plan}}", actionPlan);
  return out;
}

async function getContextForRequest(
  request: GenerateWorksheetRequest,
): Promise<WorksheetContext> {
  if (!request.student_id) return DEFAULT_WORKSHEET_CONTEXT;
  const profile = await getProfile(request.student_id);
  return profile ? contextFromProfile(profile) : DEFAULT_WORKSHEET_CONTEXT;
}

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
  if (plan.question_type !== undefined) merged.question_type = plan.question_type;
  if (plan.item_count !== undefined) merged.item_count = plan.item_count;
  return merged;
}

// function-length-ignore
export async function buildWorksheetPrompt(
  request: GenerateWorksheetRequest,
): Promise<WorksheetPromptResponse> {
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
  return {
    prompt: substitutePrompt(
      template,
      ctxFinal,
      requestWithPlan,
      formatBlock,
      "",
      "",
    ),
  };
}
