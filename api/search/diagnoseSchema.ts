//  Request/response schemas for misconception diagnosis.

import { z } from '@hono/zod-openapi';

export const DiagnoseRequestSchema = z
  .object({
    response_text: z.string().optional(),
    item_id: z.string().optional(),
    selected_option_index: z.number().int().min(0)
      .optional(),
    actor_id: z.string().optional(),
  })
  .refine(
    (v) =>
      (typeof v.response_text === 'string' &&
        v.response_text.length > 0) ||
      (typeof v.item_id === 'string' &&
        v.item_id.length > 0 &&
        typeof v.selected_option_index === 'number'),
    {
      message:
        'Either response_text or (item_id + selected_option_index) required',
    },
  )
  .openapi({
    description:
      'Either response_text or (item_id + selected_option_index) required',
  });
export type DiagnoseRequest = z.infer<
  typeof DiagnoseRequestSchema
>;

export const DiagnoseOutputSchema = z.object({
  diagnosis: z.string(),
  concept_id: z.string().optional(),
});
export type DiagnoseOutput = z.infer<
  typeof DiagnoseOutputSchema
>;

//  Copilot-facing response: student, error_type, related_ontology_node.
export const DiagnoseResponseSchema = z
  .object({
    student: z.string().optional(),
    error_type: z.string(),
    related_ontology_node: z.string().optional(),
  })
  .openapi('DiagnoseResponse');
export type DiagnoseResponse = z.infer<
  typeof DiagnoseResponseSchema
>;
