import { getScriptContent } from "../script/scripts.service.ts";

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
    templatePath: "docs/contract/contract-pedagogy-prompt.md",
    formatPath: "docs/contract/contract-pedagogy-format.md",
  },
  mid_grammar: {
    templatePath: "docs/contract/contract-syllabus-prompt.md",
    formatPath: "docs/contract/contract-syllabus-format.md",
  },
  mid_reading: {
    templatePath: "docs/contract/contract-read-prompt.md",
    formatPath: "docs/contract/contract-read-format.md",
  },
};

export function resolveTemplatePaths(
  qt: string,
): { templatePath: string; formatPath: string } {
  const fallback = {
    templatePath: "docs/contract/contract-prompt.md",
    formatPath: "docs/contract/contract-assessment-format.md",
  };
  return TEMPLATE_PATHS[qt] ?? fallback;
}
