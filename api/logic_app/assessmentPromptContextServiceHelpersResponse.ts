//  Prompt context: target/avoid labels and final response. Used by promptContextServiceHelpers.

import type {
  Difficulty,
  PromptContextResponse,
} from './assessmentPromptContextSchema.ts';

export type PromptContextResult =
  | { ok: true; response: PromptContextResponse }
  | { ok: false; status: 400; message: string };

const DEFAULT_DIFFICULTY: Difficulty = 'Medium';

export function buildTargetAvoidLabels(
  validUnitIds: string[],
  labelsMap: Map<string, string>,
  unitIdLastGrade: Map<string, number>,
  masteredThreshold: number,
): { targetLabels: string[]; avoidLabels: string[] } {
  const targetLabels: string[] = [];
  const avoidLabels: string[] = [];
  for (const uid of validUnitIds) {
    const label = labelsMap.get(uid);
    if (label == null) continue;
    const lastGrade = unitIdLastGrade.get(uid);
    if (
      lastGrade != null && lastGrade >= masteredThreshold
    ) {
      avoidLabels.push(label);
    } else {
      targetLabels.push(label);
    }
  }
  return { targetLabels, avoidLabels };
}

export function buildFinalResponse(
  next: {
    validUnitIds: string[];
    labelsMap: Map<string, string>;
  },
  unitIdLastGrade: Map<string, number>,
): PromptContextResult {
  const { targetLabels, avoidLabels } =
    buildTargetAvoidLabels(
      next.validUnitIds,
      next.labelsMap,
      unitIdLastGrade,
      3,
    );
  return {
    ok: true,
    response: {
      target_concepts: targetLabels,
      difficulty: DEFAULT_DIFFICULTY,
      avoid_concepts: avoidLabels,
    },
  };
}
