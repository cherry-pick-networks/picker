//  Response schema for GET /views/source-dashboard/:id.

import { z } from 'zod';
import { SourceSchema } from './sourceSchema.ts';

export const SourceDashboardViewSchema = z.object({
  source_info: SourceSchema,
  lexis_summary: z.object({
    total: z.number(),
    preview: z.array(z.string()),
  }),
  related_items: z.object({
    total: z.number(),
    preview_ids: z.array(z.string()),
    preview: z.array(
      z.object({
        item_id: z.string(),
        stem: z.string().optional(),
        concept_id: z.string().optional(),
        source: z.string().optional(),
      }),
    ),
  }),
});
export type SourceDashboardView = z.infer<
  typeof SourceDashboardViewSchema
>;
