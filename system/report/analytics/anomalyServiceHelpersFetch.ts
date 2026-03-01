//  Anomaly detection: date ranges, fetch rates, one-actor drops. Used by anomalyServiceHelpers.

import { IdentityStores } from '#system/identity/IdentityStores.ts';
import type {
  AnomalyInput,
  AnomalyResult,
} from './anomalyServiceTypes.ts';

export function passRate(
  outcomes: { passed: boolean }[],
): number {
  if (outcomes.length === 0) return 0;
  const pass = outcomes.filter((o) => o.passed).length;
  return pass / outcomes.length;
}

export function dateRanges(
  now: Date,
  recentDays: number,
  baselineDays: number,
): {
  recentFrom: string;
  recentTo: string;
  baselineFrom: string;
  baselineTo: string;
} {
  const recentMs = recentDays * 24 * 60 * 60 * 1000;
  const baselineMs = baselineDays * 24 * 60 * 60 * 1000;
  return {
    recentFrom: new Date(now.getTime() - recentMs)
      .toISOString(),
    recentTo: now.toISOString(),
    baselineFrom: new Date(now.getTime() - baselineMs)
      .toISOString(),
    baselineTo: new Date(now.getTime() - recentMs)
      .toISOString(),
  };
}

export async function fetchRatesForActor(
  actorId: string,
  input: AnomalyInput,
  ranges: ReturnType<typeof dateRanges>,
): Promise<{
  recentRate: number;
  baselineRate: number;
  recent: { passed: boolean }[];
  baseline: { passed: boolean }[];
}> {
  const all = await IdentityStores.achievementStore
    .listConceptOutcomesByActor(
      actorId,
      undefined,
      undefined,
    );
  const relevant = all.filter((o) =>
    o.scheme_id === input.scheme_id
  );
  const byRange = {
    recent: relevant.filter(
      (o) =>
        o.recorded_at >= ranges.recentFrom &&
        o.recorded_at <= ranges.recentTo,
    ),
    baseline: relevant.filter(
      (o) =>
        o.recorded_at >= ranges.baselineFrom &&
        o.recorded_at <= ranges.baselineTo,
    ),
  };
  return {
    recentRate: passRate(byRange.recent),
    baselineRate: passRate(byRange.baseline),
    recent: byRange.recent,
    baseline: byRange.baseline,
  };
}

export async function oneActorRatesAndDrops(
  actorId: string,
  input: AnomalyInput,
  ranges: ReturnType<typeof dateRanges>,
  threshold: number,
): Promise<{ rate: number; drop?: AnomalyResult }> {
  const data = await fetchRatesForActor(
    actorId,
    input,
    ranges,
  );
  const drop = data.baseline.length > 0 &&
      data.recent.length > 0 &&
      data.baselineRate - data.recentRate >= threshold
    ? {
      actor_id: actorId,
      kind: 'pass_rate_drop' as const,
      recent_pass_rate: data.recentRate,
      baseline_pass_rate: data.baselineRate,
      message: `Pass rate dropped from ${
        (data.baselineRate * 100).toFixed(0)
      }% to ${(data.recentRate * 100).toFixed(0)}%`,
    }
    : undefined;
  return { rate: data.recentRate, drop };
}
