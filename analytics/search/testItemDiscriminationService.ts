//  Item discrimination: high-group correct % minus low-group correct %.

import { ReportStores } from '#reporting/ReportStores.ts';
import { computeItems } from './testItemDiscriminationServiceCompute.ts';
import {
  buildActorScores,
  highLowIds,
} from './testItemDiscriminationServiceHelpers.ts';

export interface TestItemDiscriminationInput {
  scheme_id: string;
  from?: string;
  to?: string;
  min_responses?: number;
}

export async function getTestItemDiscrimination(
  input: TestItemDiscriminationInput,
) {
  const rows = await ReportStores.itemDiscriminationStore
    .listItemResponsesForDiscrimination(
      input.from,
      input.to,
    );
  const actorScores = buildActorScores(rows);
  const { highIds, lowIds } = highLowIds(actorScores);
  return {
    items: computeItems(
      rows,
      highIds,
      lowIds,
      input.min_responses ?? 1,
    ),
  };
}
