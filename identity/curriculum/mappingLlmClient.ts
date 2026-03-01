//
// LLM client for curriculum → external standard mapping. Uses unified client;
// CURRICULUM_MAPPING_LLM_MOCK for tests.
//

import { chat } from '#api/postgresql/services/llmClient.ts';
import {
  type CurriculumMappingOutput,
  CurriculumMappingOutputSchema,
} from './mappingSchema.ts';

export type MappingLlmResult =
  | { ok: true; output: CurriculumMappingOutput }
  | { ok: false; error: string };

function buildMessages(
  dumpText: string,
  nationalStandard: string,
) {
  const system =
    'You return only valid JSON. Keys: national_standard (string), level ' +
    '(string), mappings (array of { internal: { unit_id, week_number?, ' +
    'slot_index?, source_id? }, external: { code, label? } }). ' +
    'Map each internal curriculum slot to the given external standard.';
  const user = 'External standard: ' + nationalStandard +
    '\n\nInternal curriculum ' +
    'dump:\n' + dumpText +
    '\n\nReturn the mapping JSON only.';
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function parseMappingResult(
  content: string,
): MappingLlmResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const out = CurriculumMappingOutputSchema.safeParse(
      parsed,
    );
    if (!out.success) {
      return { ok: false, error: out.error.message };
    }
    return { ok: true, output: out.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

function mockMappingOutput(
  nationalStandard: string,
  level: string,
): MappingLlmResult {
  return {
    ok: true,
    output: {
      national_standard: nationalStandard,
      level,
      mappings: [],
    },
  };
}

export async function generateMapping(
  dumpText: string,
  nationalStandard: string,
  level: string,
): Promise<MappingLlmResult> {
  if (Deno.env.get('CURRICULUM_MAPPING_LLM_MOCK')) {
    return mockMappingOutput(nationalStandard, level);
  }
  const result = await chat(
    'curriculum_mapping',
    buildMessages(dumpText, nationalStandard),
  );
  if (!result.ok) return { ok: false, error: result.error };
  return parseMappingResult(result.content);
}
