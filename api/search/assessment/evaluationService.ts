//  Wrong-answer generation (51) and adaptive-next-item (52).

import type {
  AdaptiveNextItemRequest,
  WrongAnswerGenerateRequest,
} from './evaluationSchema.ts';

export async function generateWrongAnswer(
  _req: WrongAnswerGenerateRequest,
): Promise<{ options: string[] }> {
  await Promise.resolve();
  return { options: [] };
}

export async function getAdaptiveNextItem(
  _req: AdaptiveNextItemRequest,
): Promise<{ item?: Record<string, unknown> }> {
  await Promise.resolve();
  return {};
}
