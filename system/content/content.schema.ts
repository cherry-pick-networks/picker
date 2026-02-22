import { z } from "zod";

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
  session_id: z.string().optional(),
  date_iso: z.string().optional(),
  sheet_label: z.string().optional(),
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
