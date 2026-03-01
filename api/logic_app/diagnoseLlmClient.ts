//
// LLM client for misconception diagnosis. Uses unified LLM client;
// DIAGNOSE_MISCONCEPTION_LLM_MOCK for tests.
//

import {
  type DiagnoseOutput,
  DiagnoseOutputSchema,
} from './diagnoseSchema.ts';
import { chat } from '#api/postgresql/services/llmClient.ts';

export type DiagnoseLlmResult =
  | { ok: true; output: DiagnoseOutput }
  | { ok: false; error: string };

const MOCK_OUTPUT: DiagnoseOutput = {
  diagnosis:
    'Student confuses present simple with present continuous.',
  concept_id: 'bloom-2',
};

function buildMessages(responseText: string) {
  const system =
    'You return only valid JSON with keys: diagnosis (string, one ' +
    'sentence describing the misconception or cognitive error), optional ' +
    'concept_id (single concept ID from Bloom/CEFR/ACTFL/doctype if ' +
    'applicable).';
  const user =
    `Student response or selected wrong option:\n${responseText}\n\n` +
    'Return the misconception diagnosis as JSON only.';
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export async function diagnoseMisconception(
  responseText: string,
): Promise<DiagnoseLlmResult> {
  if (Deno.env.get('DIAGNOSE_MISCONCEPTION_LLM_MOCK')) {
    return { ok: true, output: MOCK_OUTPUT };
  }
  const result = await chat(
    'diagnose',
    buildMessages(responseText),
  );
  if (!result.ok) return { ok: false, error: result.error };
  try {
    const parsed = JSON.parse(result.content) as unknown;
    const out = DiagnoseOutputSchema.safeParse(parsed);
    if (!out.success) {
      return { ok: false, error: out.error.message };
    }
    return { ok: true, output: out.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
