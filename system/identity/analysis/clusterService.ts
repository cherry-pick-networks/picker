//  Clustering: group actors by similar concept outcome profile.

import {
  buildClusters,
  buildVectors,
} from './clusterServiceHelpers.ts';
import type { ClusterInput } from './clusterServiceTypes.ts';

export type {
  ActorConceptVector,
  ClusterInput,
} from './clusterServiceTypes.ts';

export async function clusterActorsByOutcome(
  input: ClusterInput,
): Promise<{ clusters: string[][] }> {
  const vectors = await buildVectors(input);
  const clusters = buildClusters(vectors);
  return { clusters };
}
