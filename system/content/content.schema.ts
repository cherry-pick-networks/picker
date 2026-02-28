import { z } from "zod";

export const ItemSchema = z.object({
  item_id: z.string(),
  concept_id: z.string().optional(),
  subject_ids: z.array(z.string()).optional(),
  content_type_id: z.string().optional(),
  cognitive_level_id: z.string().optional(),
  context_ids: z.array(z.string()).optional(),
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

export const CreateWorksheetRequestSchema = z.object({
  title: z.string().optional(),
  item_ids: z.array(z.string()),
});
export type CreateWorksheetRequest = z.infer<
  typeof CreateWorksheetRequestSchema
>;

export const GenerateWorksheetRequestSchema = z.object({
  title: z.string().optional(),
  concept_ids: z.array(z.string()).default([]),
  item_count: z.number().optional(),
  student_id: z.string().optional(),
  question_type: z.string().optional(),
  week: z.number().optional(),
  elem_slot_index: z.number().optional(),
  subject_weights: z
    .record(z.string(), z.number().min(0).max(1))
    .optional(),
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

export const GenerateItemsRequestSchema = z.object({
  source_id: z.string(),
  unit_id: z.string(),
  topic_label: z.string().optional(),
  question_type: z.string().optional(),
  count: z.number().int().min(1).max(10).optional(),
});
export type GenerateItemsRequest = z.infer<
  typeof GenerateItemsRequestSchema
>;

export const ItemPatchSchema = ItemSchema.partial().omit({ item_id: true });
export type ItemPatch = z.infer<typeof ItemPatchSchema>;
