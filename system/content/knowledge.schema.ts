/**
 * Knowledge graph schemas. Node/Edge for English teaching materials; persisted
 * in knowledge_node and knowledge_edge (shared/infra/schema/05_knowledge.sql).
 */

import { z } from "zod";

export const KnowledgeNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().optional(),
});
export type KnowledgeNode = z.infer<typeof KnowledgeNodeSchema>;

export const KnowledgeEdgeSchema = z.object({
  from_id: z.string(),
  to_id: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().optional(),
});
export type KnowledgeEdge = z.infer<typeof KnowledgeEdgeSchema>;
