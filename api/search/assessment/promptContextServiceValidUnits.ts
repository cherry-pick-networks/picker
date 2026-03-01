//  Prompt context: valid unit IDs and labels. Used by promptContextServiceHelpers.

import { GovernanceStores } from '#api/config/GovernanceStores.ts';
import { allowlistHas } from '#api/config/allowlistTypes.ts';
import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import type { PromptContextResponse } from './promptContextSchema.ts';

const DEFAULT_DIFFICULTY = 'Medium' as const;

export async function getValidUnitIdsAndLabels(
  allowlist: Awaited<
    ReturnType<typeof getAllowlistDataOrLoad>
  >,
  unitIds: Set<string>,
): Promise<
  | { kind: 'empty'; response: PromptContextResponse }
  | {
    kind: 'units';
    validUnitIds: string[];
    labelsMap: Map<string, string>;
  }
> {
  const validUnitIds = [...unitIds].filter((id) =>
    allowlistHas(allowlist, 'concept', id)
  );
  if (validUnitIds.length === 0) {
    return {
      kind: 'empty',
      response: {
        target_concepts: [],
        difficulty: DEFAULT_DIFFICULTY,
        avoid_concepts: [],
      },
    };
  }
  const labelsMap = await GovernanceStores.conceptStore
    .getConceptPrefLabels(validUnitIds);
  return { kind: 'units', validUnitIds, labelsMap };
}
