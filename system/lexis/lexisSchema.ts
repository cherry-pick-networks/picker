/** Lexis entry schema (Zod). */

import { z } from "zod";

export const LexisEntrySchema = z.object({
  source_id: z.string(),
  entry_index: z.number().int().nonnegative(),
  day_index: z.number().int().min(1),
  headword: z.string(),
  meaning: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()).nullable(),
});
export type LexisEntry = z.infer<typeof LexisEntrySchema>;
