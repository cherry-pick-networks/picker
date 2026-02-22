/**
 * Worksheet prompt formatting: context from profile, template substitution.
 * Used by content-prompt.service buildWorksheetPrompt.
 */

import { getProfile } from "#system/actor/profile.service.ts";
import type { WorksheetContext } from "./content-prompt.types.ts";
import {
  DEFAULT_QUESTION_TYPE,
  DEFAULT_WORKSHEET_CONTEXT,
} from "./content-prompt.types.ts";
import type { GenerateWorksheetRequest } from "./content.schema.ts";

export type { WorksheetContext };

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
    : DEFAULT_WORKSHEET_CONTEXT.goal_accuracy;
  return {
    student_name: profile.id,
    goal_accuracy: goalStr,
    structural_notes: (wg.structural_notes as string) ?? "",
    vocabulary_policy: (wg.vocabulary_policy as string) ??
      DEFAULT_WORKSHEET_CONTEXT.vocabulary_policy,
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

export async function getContextForRequest(
  request: GenerateWorksheetRequest,
): Promise<WorksheetContext> {
  if (!request.student_id) return DEFAULT_WORKSHEET_CONTEXT;
  const profile = await getProfile(request.student_id);
  return profile ? contextFromProfile(profile) : DEFAULT_WORKSHEET_CONTEXT;
}
