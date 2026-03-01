import { z } from 'zod';

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

export const CreateItemRequestSchema = ItemSchema.omit({
  item_id: true,
  created_at: true,
}).extend({
  item_id: z.string().optional(),
  created_at: z.string().optional(),
});
export type CreateItemRequest = z.infer<
  typeof CreateItemRequestSchema
>;

export const ItemPatchSchema = ItemSchema.partial().omit({
  item_id: true,
});
export type ItemPatch = z.infer<typeof ItemPatchSchema>;
