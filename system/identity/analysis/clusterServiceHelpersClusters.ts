//  Clustering: findGroup, buildClustersLoop, buildClusters. Used by clusterServiceHelpers.

import { cosineSimilarity } from './clusterServiceHelpersSimilarity.ts';
import type { ActorConceptVector } from './clusterServiceTypes.ts';

function findGroup(
  i: number,
  vectors: ActorConceptVector[],
  passedSets: Set<string>[],
  assigned: Set<string>,
): string[] {
  const group = [vectors[i].actor_id];
  assigned.add(vectors[i].actor_id);
  for (let j = i + 1; j < vectors.length; j++) {
    if (assigned.has(vectors[j].actor_id)) continue;
    const sim = cosineSimilarity(
      passedSets[i],
      passedSets[j],
    );
    if (sim >= 0.5) {
      group.push(vectors[j].actor_id);
      assigned.add(vectors[j].actor_id);
    }
  }
  return group;
}

function buildClustersLoop(
  vectors: ActorConceptVector[],
  passedSets: Set<string>[],
): string[][] {
  const assigned = new Set<string>();
  const clusters: string[][] = [];
  for (let i = 0; i < vectors.length; i++) {
    if (assigned.has(vectors[i].actor_id)) continue;
    clusters.push(
      findGroup(i, vectors, passedSets, assigned),
    );
  }
  return clusters;
}

export function buildClusters(
  vectors: ActorConceptVector[],
): string[][] {
  const passedSets = vectors.map((v) =>
    new Set(v.passed_codes)
  );
  return buildClustersLoop(vectors, passedSets);
}
