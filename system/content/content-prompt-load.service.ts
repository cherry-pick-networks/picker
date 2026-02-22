import { getScriptContent } from "#system/script/scripts.service.ts";

export const DEFAULT_GOAL_ACCURACY = "85%";
export const DEFAULT_VOCABULARY = "Fry Sight Words + attached list";

export const DEFAULT_TEMPLATE = "# Role: English Test Creator\n" +
  "# Target Student: {{student_name}}\n" +
  "# Goal: {{goal_accuracy}} Accuracy.\n\n" +
  "## Request context\n- Concept IDs: {{concept_ids}}\n" +
  "{{output_format}}";

export async function loadTemplate(relativePath: string): Promise<string> {
  const result = await getScriptContent(relativePath);
  return result.ok ? result.content : "";
}

const TEMPLATE_PATHS: Record<
  string,
  { templatePath: string; formatPath: string }
> = {
  mid_skills: {
    templatePath: "contract-pedagogy-prompt.md",
    formatPath: "contract-pedagogy-format.md",
  },
  mid_grammar: {
    templatePath: "contract-syllabus-prompt.md",
    formatPath: "contract-syllabus-format.md",
  },
  mid_reading: {
    templatePath: "contract-read-prompt.md",
    formatPath: "contract-read-format.md",
  },
};

export function resolveTemplatePaths(
  qt: string,
): { templatePath: string; formatPath: string } {
  const fallback = {
    templatePath: "contract-prompt.md",
    formatPath: "contract-assessment-format.md",
  };
  return TEMPLATE_PATHS[qt] ?? fallback;
}

async function loadMidTemplateAndFormat(
  qt: string,
): Promise<{ template: string; formatBlock: string }> {
  const { templatePath, formatPath } = resolveTemplatePaths(qt);
  const template = (await loadTemplate(templatePath)) || DEFAULT_TEMPLATE;
  const formatBlock = await loadTemplate(formatPath);
  return { template, formatBlock };
}

export async function loadTemplateAndFormat(
  qt: string,
): Promise<{ template: string; formatBlock: string }> {
  if (qt === "elem") {
    const t = (await loadTemplate("contract-edu-prompt.md")) ||
      DEFAULT_TEMPLATE;
    return { template: t, formatBlock: "" };
  }
  return await loadMidTemplateAndFormat(qt);
}
