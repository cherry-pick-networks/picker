import { z } from "zod";
import * as contentStore from "../store/content.ts";
import { readScript } from "../store/scripts.ts";
import { getProfile } from "./profile.ts";

export const ItemSchema = z.object({
  item_id: z.string(),
  concept_id: z.string().optional(),
  stem: z.string().optional(),
  difficulty: z.string().optional(),
  created_at: z.string().optional(),
  source: z.string().optional(),
  options: z.array(z.string()).optional(),
  correct: z.number().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
});
export type Item = z.infer<typeof ItemSchema>;

export const WorksheetSchema = z.object({
  worksheet_id: z.string(),
  title: z.string().optional(),
  item_ids: z.array(z.string()).default([]),
  generated_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Worksheet = z.infer<typeof WorksheetSchema>;

export const CreateItemRequestSchema = ItemSchema.omit({
  item_id: true,
  created_at: true,
}).extend({
  item_id: z.string().optional(),
  created_at: z.string().optional(),
});
export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;

export const GenerateWorksheetRequestSchema = z.object({
  title: z.string().optional(),
  concept_ids: z.array(z.string()).default([]),
  item_count: z.number().optional(),
  student_id: z.string().optional(),
  question_type: z.string().optional(),
  week: z.number().optional(),
  elem_slot_index: z.number().optional(),
});
export type GenerateWorksheetRequest = z.infer<
  typeof GenerateWorksheetRequestSchema
>;

export const WorksheetPromptResponseSchema = z.object({
  prompt: z.string(),
});
export type WorksheetPromptResponse = z.infer<
  typeof WorksheetPromptResponseSchema
>;

export const ItemPatchSchema = ItemSchema.partial().omit({ item_id: true });
export type ItemPatch = z.infer<typeof ItemPatchSchema>;

const DEFAULT_QUESTION_TYPE = "CSAT Type 40 (Summary Completion)";
const DEFAULT_GOAL_ACCURACY = "85%";
const DEFAULT_VOCABULARY = "Fry Sight Words + attached list";

function nowIso(): string {
  return new Date().toISOString();
}

function parseItem(raw: unknown): Item {
  const parsed = ItemSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid item");
  return parsed.data;
}

function parseWorksheet(raw: unknown): Worksheet {
  const parsed = WorksheetSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid worksheet");
  return parsed.data;
}

export async function getItem(id: string): Promise<Item | null> {
  const raw = await contentStore.getItem(id);
  if (raw == null) return null;
  const parsed = ItemSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function buildItemRaw(body: CreateItemRequest): Item {
  const id = body.item_id ?? crypto.randomUUID();
  const created_at = body.created_at ?? nowIso();
  return parseItem({
    ...body,
    item_id: id,
    created_at,
  });
}

export async function createItem(body: CreateItemRequest): Promise<Item> {
  const item = buildItemRaw(body);
  await contentStore.setItem(item as unknown as Record<string, unknown>);
  return item;
}

export async function updateItem(
  id: string,
  body: ItemPatch,
): Promise<Item | null> {
  const existing = await getItem(id);
  if (existing == null) return null;
  const merged = { ...existing, ...body, item_id: id };
  const item = parseItem(merged);
  await contentStore.setItem(item as unknown as Record<string, unknown>);
  return item;
}

export async function getWorksheet(id: string): Promise<Worksheet | null> {
  const raw = await contentStore.getWorksheet(id);
  if (raw == null) return null;
  const parsed = WorksheetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function generateWorksheet(
  request: GenerateWorksheetRequest,
): Promise<Worksheet> {
  const worksheet_id = crypto.randomUUID();
  const item_ids: string[] = [];
  const conceptIds = request.concept_ids?.length
    ? request.concept_ids
    : [];
  const perConcept = Math.max(
    1,
    Math.floor((request.item_count ?? 5) / Math.max(1, conceptIds.length)),
  );
  for (const cid of conceptIds) {
    const items = await contentStore.listItemsByConcept(cid);
    for (let i = 0; i < perConcept && i < items.length; i++) {
      const it = items[i];
      const id = it?.item_id as string;
      if (id) item_ids.push(id);
    }
  }
  const worksheet: Worksheet = {
    worksheet_id,
    title: request.title ?? `Worksheet ${worksheet_id.slice(0, 8)}`,
    item_ids,
    generated_at: nowIso(),
    metadata: { concept_ids: conceptIds },
  };
  await contentStore.setWorksheet(
    worksheet as unknown as Record<string, unknown>,
  );
  return worksheet;
}

type WorksheetContext = {
  student_name: string;
  goal_accuracy: string;
  structural_notes: string;
  vocabulary_policy: string;
};

function contextFromProfile(profile: {
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

function substitutePrompt(
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

const DEFAULT_TEMPLATE =
  "# Role: English Test Creator\n" +
  "# Target Student: {{student_name}}\n" +
  "# Goal: {{goal_accuracy}} Accuracy.\n\n" +
  "## Request context\n- Concept IDs: {{concept_ids}}\n" +
  "{{output_format}}";

async function loadTemplate(
  relativePath: string,
): Promise<string> {
  const result = await readScript(relativePath);
  return result.ok ? result.content : "";
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
    const elemTemplate = await loadTemplate("docs/contract/contract-edu-prompt.md");
    template = elemTemplate || DEFAULT_TEMPLATE;
  } else {
    const templatePath =
      qt === "mid_skills"
        ? "docs/contract/contract-pedagogy-prompt.md"
        : qt === "mid_grammar"
          ? "docs/contract/contract-syllabus-prompt.md"
          : qt === "mid_reading"
            ? "docs/contract/contract-read-prompt.md"
            : "docs/contract/contract-prompt.md";
    const formatPath =
      qt === "mid_skills"
        ? "docs/contract/contract-pedagogy-format.md"
        : qt === "mid_grammar"
          ? "docs/contract/contract-syllabus-format.md"
          : qt === "mid_reading"
            ? "docs/contract/contract-read-format.md"
            : "docs/contract/contract-assessment-format.md";
    const loaded = await loadTemplate(templatePath);
    if (loaded) template = loaded;
    formatBlock = await loadTemplate(formatPath);
  }

  const prompt = substitutePrompt(
    template,
    ctx,
    request,
    formatBlock,
    "",
    "",
  );
  return { prompt };
}
