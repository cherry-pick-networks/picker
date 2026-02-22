/** Pure grading: submission + items -> GradingResult. */

import type {
  GradingResult,
  Item,
  ItemResult,
  Submission,
} from "./content.schema.ts";

function oneItemResult(
  item: Item,
  chosen: number,
  correctIndex: number,
): ItemResult {
  const opts = item.options ?? [];
  return {
    item_id: item.item_id,
    chosen,
    correct_index: correctIndex,
    is_correct: chosen === correctIndex,
    options: opts.length > 0 ? opts : undefined,
    chosen_text: opts[chosen],
    correct_text: opts[correctIndex],
  };
}

export function gradeSubmission(
  submission: Submission,
  items: Item[],
): GradingResult {
  const results: ItemResult[] = [];
  for (const item of items) {
    const correctIndex = item.correct ?? 0;
    const chosen = submission.answers[item.item_id] ?? -1;
    results.push(oneItemResult(item, chosen, correctIndex));
  }
  const correct = results.filter((r) => r.is_correct).length;
  const total = results.length;
  const score = total > 0 ? correct / total : 0;
  return { total, correct, score, results };
}
