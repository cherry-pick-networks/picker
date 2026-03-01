//  RAG recommend: concept expansion. Used by ragService.ts.

import { GovernanceStores } from '#system/governance/GovernanceStores.ts';

async function resolveExpandedIdsAndLabels(
  expand: boolean,
  conceptIds: string[] | undefined,
): Promise<
  { expandedIds: string[]; expandedLabels: string[] }
> {
  let expandedIds: string[] = [];
  let expandedLabels: string[] = [];
  if (
    expand && conceptIds != null && conceptIds.length > 0
  ) {
    const neighbors = await GovernanceStores.conceptStore
      .getNeighborConceptCodes(conceptIds);
    expandedIds = [
      ...new Set([...conceptIds, ...neighbors]),
    ];
    const labelsMap = await GovernanceStores.conceptStore
      .getConceptPrefLabels(expandedIds);
    expandedLabels = expandedIds
      .map((id) => labelsMap.get(id))
      .filter((l): l is string => l != null);
  } else if (conceptIds != null && conceptIds.length > 0) {
    expandedIds = conceptIds;
  }
  return { expandedIds, expandedLabels };
}

export async function expandConcepts(
  conceptIds: string[] | undefined,
  expand: boolean,
  query: string,
): Promise<{
  expandedIds: string[];
  expandedLabels: string[];
  embeddingText: string;
}> {
  const { expandedIds, expandedLabels } =
    await resolveExpandedIdsAndLabels(expand, conceptIds);
  const embeddingText = expandedLabels.length > 0
    ? `${query}\nRelated concepts: ${
      expandedLabels.join(', ')
    }`
    : query;
  return { expandedIds, expandedLabels, embeddingText };
}
