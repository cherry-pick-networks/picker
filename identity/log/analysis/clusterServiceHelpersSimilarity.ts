//  Clustering: set intersection and cosine similarity. Used by clusterServiceHelpers.

export function intersectionSize(
  a: Set<string>,
  b: Set<string>,
): number {
  let n = 0;
  for (const c of a) if (b.has(c)) n++;
  return n;
}

export function cosineSimilarity(
  a: Set<string>,
  b: Set<string>,
): number {
  if (a.size === 0 && b.size === 0) return 1;
  const inter = intersectionSize(a, b);
  return inter / (Math.sqrt(a.size * b.size) || 1);
}
