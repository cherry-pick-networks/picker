import type { GenerateWorksheetRequest, WorksheetPromptResponse } from './contentSchema.ts';
import {
  DEFAULT_QUESTION_TYPE,
  DEFAULT_WORKSHEET_CONTEXT,
  type WorksheetContext,
} from './contentWorksheetContextTypes.ts';

export type { WorksheetContext };
import { getProfile } from '#system/actor/profileService.ts';
import {
  DEFAULT_GOAL_ACCURACY,
  DEFAULT_TEMPLATE,
  DEFAULT_VOCABULARY,
  loadTemplate,
  resolveTemplatePaths,
} from './contentPromptLoadService.ts';

export function contextFromProfile(profile: {
  id: string;
  preferences?: Record<string, unknown>;
}): WorksheetContext {
  const wg = (profile.preferences?.worksheet_generation ?? {}) as Record<
    string,
    unknown
  >;
  const goal = wg.goal_accuracy as number | undefined;
  const goalStr = goal != null ? `${Math.round(goal * 100)}%` : DEFAULT_GOAL_ACCURACY;
  return {
    student_name: profile.id,
    goal_accuracy: goalStr,
    structural_notes: (wg.structural_notes as string) ?? '',
    vocabulary_policy: (wg.vocabulary_policy as string) ?? DEFAULT_VOCABULARY,
  };
}

export function substitutePrompt(
  template: string,
  ctx: WorksheetContext,
  request: GenerateWorksheetRequest,
  formatBlock: string,
  mainTheme = '',
  actionPlan = '',
): string {
  const out = template
    .replace('{{student_name}}', ctx.student_name || 'Unknown')
    .replace('{{goal_accuracy}}', ctx.goal_accuracy)
    .replace('{{structural_notes}}', ctx.structural_notes)
    .replace(
      '{{question_type}}',
      request.question_type?.trim() || DEFAULT_QUESTION_TYPE,
    )
    .replace('{{item_count}}', String(request.item_count ?? 5))
    .replace('{{concept_ids}}', (request.concept_ids ?? []).join(', '))
    .replace('{{vocabulary_policy}}', ctx.vocabulary_policy)
    .replace('{{output_format}}', formatBlock)
    .replace('{{main_theme}}', mainTheme)
    .replace('{{action_plan}}', actionPlan);
  return out;
}

async function getContextForRequest(
  request: GenerateWorksheetRequest,
): Promise<WorksheetContext> {
  if (!request.student_id) return DEFAULT_WORKSHEET_CONTEXT;
  const profile = await getProfile(request.student_id);
  return profile ? contextFromProfile(profile) : DEFAULT_WORKSHEET_CONTEXT;
}

async function loadElemTemplate(): Promise<{
  template: string;
  formatBlock: string;
}> {
  const p = 'docs/contract/contract-edu-prompt.md';
  const template = (await loadTemplate(p)) || DEFAULT_TEMPLATE;
  return { template, formatBlock: '' };
}

async function loadMidTemplate(
  qt: string,
): Promise<{ template: string; formatBlock: string }> {
  const { templatePath, formatPath } = resolveTemplatePaths(qt);
  const template = (await loadTemplate(templatePath)) || DEFAULT_TEMPLATE;
  const formatBlock = await loadTemplate(formatPath);
  return { template, formatBlock };
}

async function loadTemplateAndFormat(
  qt: string,
): Promise<{ template: string; formatBlock: string }> {
  if (qt === 'elem') return await loadElemTemplate();
  return await loadMidTemplate(qt);
}

export async function buildWorksheetPrompt(
  request: GenerateWorksheetRequest,
): Promise<WorksheetPromptResponse> {
  const ctx = await getContextForRequest(request);
  const qt = (request.question_type ?? '').trim().toLowerCase();
  const { template, formatBlock } = await loadTemplateAndFormat(qt);
  return {
    prompt: substitutePrompt(template, ctx, request, formatBlock, '', ''),
  };
}
