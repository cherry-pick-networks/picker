//  Rubric evaluation data; governance/store or seed when using LLM.

export interface InstructionRubricEvaluationDataInput {
  concept_id?: string;
  type?: string;
}

export function getRubricEvaluationData(
  _input: InstructionRubricEvaluationDataInput,
) {
  const out = { rubric: [] };
  return out;
}
