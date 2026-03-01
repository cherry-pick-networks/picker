//  Zod schemas for external curriculum mapping (LLM output and API).

import { z } from 'zod';

export const MappingEntryInternalSchema = z.object({
  unit_id: z.string(),
  week_number: z.number().optional(),
  slot_index: z.number().optional(),
  source_id: z.string().optional(),
});

export const MappingEntryExternalSchema = z.object({
  code: z.string(),
  label: z.string().optional(),
});

export const MappingEntrySchema = z.object({
  internal: MappingEntryInternalSchema,
  external: MappingEntryExternalSchema,
});

export const CurriculumMappingOutputSchema = z.object({
  national_standard: z.string(),
  level: z.string(),
  mappings: z.array(MappingEntrySchema),
});

export type CurriculumMappingOutput = z.infer<
  typeof CurriculumMappingOutputSchema
>;

export const ExternalMappingRequestSchema = z.object({
  level: z.string(),
  national_standard: z.string(),
  save_to_file: z.boolean().optional(),
});

export type ExternalMappingRequest = z.infer<
  typeof ExternalMappingRequestSchema
>;

//  Copilot-facing mapping entry: our node name + national standard code.
export const CopilotMappingEntrySchema = z.object({
  my_node: z.string(),
  national_standard_code: z.string(),
});
export type CopilotMappingEntry = z.infer<
  typeof CopilotMappingEntrySchema
>;

export function toCopilotMappings(
  output: CurriculumMappingOutput,
): CopilotMappingEntry[] {
  return output.mappings.map((m) => ({
    my_node: m.internal.unit_id,
    national_standard_code: m.external.code,
  }));
}
