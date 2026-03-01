//  Bottleneck: concepts with low pass rate across actors.

import { GovernanceStores } from '#system/governance/GovernanceStores.ts';
import { ReportStores } from '#system/report/ReportStores.ts';

export interface BottleneckInput {
  actor_ids: string[];
  scheme_id: string;
  from?: string;
  to?: string;
  min_fail_count?: number;
}

export interface BottleneckNode {
  code: string;
  pref_label?: string;
  pass_count: number;
  fail_count: number;
  pass_rate: number;
}

function aggregateByCode(
  rows: Awaited<
    ReturnType<
      typeof ReportStores.bottleneckStore.aggregateConceptOutcomes
    >
  >,
): Map<string, { pass: number; fail: number }> {
  const byCode = new Map<
    string,
    { pass: number; fail: number }
  >();
  for (const r of rows) {
    const cur = byCode.get(r.code) ?? { pass: 0, fail: 0 };
    if (r.passed) cur.pass += r.cnt;
    else cur.fail += r.cnt;
    byCode.set(r.code, cur);
  }
  return byCode;
}

function buildNodesFromByCode(
  byCode: Map<string, { pass: number; fail: number }>,
  minFailCount: number | undefined,
): BottleneckNode[] {
  const nodes: BottleneckNode[] = [];
  for (const [code, counts] of byCode) {
    const total = counts.pass + counts.fail;
    if (
      minFailCount != null && counts.fail < minFailCount
    ) continue;
    nodes.push({
      code,
      pass_count: counts.pass,
      fail_count: counts.fail,
      pass_rate: total > 0 ? counts.pass / total : 0,
    });
  }
  return nodes;
}

async function addLabels(
  nodes: BottleneckNode[],
): Promise<void> {
  const labels = await GovernanceStores.conceptStore
    .getConceptPrefLabels(
      nodes.map((n) => n.code),
    );
  for (const n of nodes) n.pref_label = labels.get(n.code);
}

async function buildNodesWithLabels(
  byCode: Map<string, { pass: number; fail: number }>,
  minFailCount: number | undefined,
): Promise<BottleneckNode[]> {
  const nodes = buildNodesFromByCode(byCode, minFailCount);
  await addLabels(nodes);
  nodes.sort((a, b) => a.pass_rate - b.pass_rate);
  return nodes;
}

export async function getBottleneckNodes(
  input: BottleneckInput,
): Promise<BottleneckNode[]> {
  const rows = await ReportStores.bottleneckStore
    .aggregateConceptOutcomes(
      input.actor_ids,
      input.scheme_id,
      input.from,
      input.to,
    );
  const byCode = aggregateByCode(rows);
  return buildNodesWithLabels(byCode, input.min_fail_count);
}
