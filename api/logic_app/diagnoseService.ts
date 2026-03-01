//
// Misconception diagnosis: call LLM, validate concept_id against allowlist.
// Returns Copilot-facing shape: student, error_type, related_ontology_node.
//

import type {
  DiagnoseOutput,
  DiagnoseRequest,
  DiagnoseResponse,
} from './diagnoseSchema.ts';
import { getResponseText } from './diagnoseInput.ts';
import { ContentLlmService } from '#api/storage/ContentLlmService.ts';
import { allowlistHas } from '#api/config/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import { GovernanceStores } from '#api/config/GovernanceStores.ts';
import { getActor } from '#identity/actors/service.ts';

export type DiagnoseOk = {
  ok: true;
  response: DiagnoseResponse;
};
export type DiagnoseFail = {
  ok: false;
  status: 400 | 404 | 502;
  message: string;
};
export type DiagnoseResult = DiagnoseOk | DiagnoseFail;

async function validateConceptId(
  conceptId: string | undefined,
): Promise<string | undefined> {
  if (conceptId == null || conceptId === '') {
    return undefined;
  }
  const data = await getAllowlistDataOrLoad();
  if (!allowlistHas(data, 'concept', conceptId)) {
    throw new Error(`Invalid concept_id: ${conceptId}`);
  }
  return conceptId;
}

async function runDiagnose(
  text: string,
): Promise<DiagnoseOutput> {
  const llm = await ContentLlmService.diagnoseMisconception(
    text,
  );
  if (!llm.ok) throw new Error(llm.error);
  return llm.output;
}

//
// Run misconception diagnosis. Input: response_text or item_id +
// selected_option_index; optional actor_id for student display name.
// Returns Copilot-facing: student, error_type, related_ontology_node.
//
export async function runMisconceptionDiagnosis(
  req: DiagnoseRequest,
): Promise<DiagnoseResult> {
  const input = await getResponseText(req);
  if ('ok' in input && !input.ok) return input;
  const { text } = input as { text: string };
  try {
    const output = await runDiagnose(text);
    const concept_id = await validateConceptId(
      output.concept_id,
    );
    let related_ontology_node: string | undefined;
    if (concept_id != null) {
      const labels = await GovernanceStores.conceptStore
        .getConceptPrefLabels([
          concept_id,
        ]);
      related_ontology_node = labels.get(concept_id);
    }
    let student: string | undefined;
    if (req.actor_id != null && req.actor_id.length > 0) {
      const actor = await getActor(req.actor_id);
      student = actor?.display_name;
    }
    const response: DiagnoseResponse = {
      ...(student != null && { student }),
      error_type: output.diagnosis,
      ...(related_ontology_node != null && {
        related_ontology_node,
      }),
    };
    return { ok: true, response };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith('Invalid ') ? 400 : 502;
    return { ok: false, status, message: msg };
  }
}
