import { z } from 'zod';

const GeneratedItemLlmSchema = z.object({
  stem: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const ItemGenerateLlmOutputSchema = z.object({
  items: z.array(GeneratedItemLlmSchema),
});

export type GeneratedItemLlm = z.infer<
  typeof GeneratedItemLlmSchema
>;
export type ItemGenerateLlmOutput = z.infer<
  typeof ItemGenerateLlmOutputSchema
>;
