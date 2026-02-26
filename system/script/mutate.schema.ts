/**
 * Zod schemas and inferred types for mutate API and LLM output.
 * Request/Response for POST /script/mutate; MutateOutputSchema for LLM parse.
 */

import { z } from "zod";

export const MutateOptionsSchema = z.object({
  maxBlocks: z.number().int().positive().optional(),
});
export type MutateOptions = z.infer<typeof MutateOptionsSchema>;

export const MutateRequestSchema = z.object({
  path: z.string().min(1),
  intent: z.string().optional(),
  options: MutateOptionsSchema.optional(),
});
export type MutateRequest = z.infer<typeof MutateRequestSchema>;

export const MutateSuccessResponseSchema = z.object({
  ok: z.literal(true),
  replacements: z.number().int().min(0),
});
export type MutateSuccessResponse = z.infer<
  typeof MutateSuccessResponseSchema
>;

export const MutateErrorResponseSchema = z.object({
  ok: z.literal(false),
  status: z.number().int(),
  body: z.unknown(),
});
export type MutateErrorResponse = z.infer<typeof MutateErrorResponseSchema>;

export const MutateResponseSchema = z.discriminatedUnion("ok", [
  MutateSuccessResponseSchema,
  MutateErrorResponseSchema,
]);
export type MutateResponse = z.infer<typeof MutateResponseSchema>;

/** LLM structured output: original snippet and mutated replacement. */
export const MutateOutputSchema = z.object({
  original: z.string(),
  mutated: z.string(),
});
export type MutateOutput = z.infer<typeof MutateOutputSchema>;
