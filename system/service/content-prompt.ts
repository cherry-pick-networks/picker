// deno-lint-ignore-file function-length/function-length
import type { GenerateWorksheetRequest, WorksheetPromptResponse } from "./content-schema.ts";
import { getProfile } from "./profile.ts";
import {
  DEFAULT_GOAL_ACCURACY,
  DEFAULT_VOCABULARY,
  DEFAULT_TEMPLATE,
  loadTemplate,
  resolveTemplatePaths,
} from "./content-prompt-load.ts";

const DEFAULT_QUESTION_TYPE = "CSAT Type 40 (Summary Completion)";

export type WorksheetContext = {
  student_name: string;
  goal_accuracy: string;
  structural_notes: string;
  vocabulary_policy: string;
};

export function contextFromProfile(profile: {
  id: string;
  preferences?: Record<string, unknown>;
}): WorksheetContext {
  const wg = (profile.preferences?.worksheet_generation ?? {}) as Record<
    string,
    unknown
  >;
  const goal = wg.goal_accuracy as number | undefined;
  const goalStr =
    goal != null ? `${Math.round(goal * 100)}%` : DEFAULT_GOAL_ACCURACY;
  return {
    student_name: profile.id,
    goal_accuracy: goalStr,
    structural_notes: (wg.structural_notes as string) ?? "",
    vocabulary_policy: (wg.vocabulary_policy as string) ?? DEFAULT_VOCABULARY,
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
  return template
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
    .replace("{{output_format}}", formatBlock)
    .replace("{{main_theme}}", mainTheme)
    .replace("{{action_plan}}", actionPlan);
}

export async function buildWorksheetPrompt(
  request: GenerateWorksheetRequest,
): Promise<WorksheetPromptResponse> {
  let ctx: WorksheetContext = {
    student_name: "Unknown",
    goal_accuracy: DEFAULT_GOAL_ACCURACY,
    structural_notes: "",
    vocabulary_policy: DEFAULT_VOCABULARY,
  };
  if (request.student_id) {
    const profile = await getProfile(request.student_id);
    if (profile) ctx = contextFromProfile(profile);
  }
  const qt = (request.question_type ?? "").trim().toLowerCase();
  let template = DEFAULT_TEMPLATE;
  let formatBlock = "";
  if (qt === "elem") {
    const p = "docs/contract/contract-edu-prompt.md";
    const elemTemplate = await loadTemplate(p);
    template = elemTemplate || DEFAULT_TEMPLATE;
  } else {
    const { templatePath, formatPath } = resolveTemplatePaths(qt);
    const loaded = await loadTemplate(templatePath);
    if (loaded) template = loaded;
    formatBlock = await loadTemplate(formatPath);
  }
  const prompt = substitutePrompt(template, ctx, request, formatBlock, "", "");
  return { prompt };
}
