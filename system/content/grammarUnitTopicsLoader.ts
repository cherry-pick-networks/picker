/** Load unit_id → topic_label from shared seed. Read-only. */

import { parse } from '@std/toml';

const SEED_URL = new URL(
  '../../../shared/infra/seed/grammar-unit-topics.toml',
  import.meta.url,
);

let cached: Record<string, string> | null = null;

// function-length-ignore
export async function loadGrammarUnitTopics(): Promise<
  Record<string, string>
> {
  if (cached != null) return cached;
  const raw = await Deno.readTextFile(SEED_URL);
  const parsed = parse(raw) as { topics?: Record<string, string> };
  const topics = parsed.topics ?? {};
  cached = topics;
  return topics;
}

export function getTopicLabel(
  topics: Record<string, string>,
  unitId: string,
): string | undefined {
  const out = topics[unitId];
  return out;
}
