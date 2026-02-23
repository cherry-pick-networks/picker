/**
 * Task queue schemas. Enqueue input (kind, payload); full row for store/API.
 * Table: task_queue (shared/infra/schema/06_task_queue.sql).
 */

import { z } from "zod";

export const EnqueueTaskSchema = z.object({
  kind: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type EnqueueTask = z.infer<typeof EnqueueTaskSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  created_at: z.string(),
  started_at: z.string().optional(),
  finished_at: z.string().optional(),
  error_message: z.string().optional(),
});
export type Task = z.infer<typeof TaskSchema>;
