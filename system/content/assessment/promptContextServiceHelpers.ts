//  Prompt context: collect units/grades, build target/avoid. Used by promptContextService.

import { IdentityStores } from '#system/identity/IdentityStores.ts';

export type PromptContextInputLike = {
  actor_ids: string[];
  from?: string;
  to?: string;
};

async function fillUnitIdsAndGrades(
  acc: {
    unitIds: Set<string>;
    unitIdLastGrade: Map<string, number>;
  },
  input: PromptContextInputLike,
): Promise<void> {
  const actorIds = input.actor_ids;
  for (const actorId of actorIds) {
    const items = await IdentityStores.scheduleStore
      .listScheduleItemsByActor(actorId);
    for (const row of items) {
      if (
        input.from != null && row.next_due_at < input.from
      ) continue;
      if (input.to != null && row.next_due_at > input.to) {
        continue;
      }
      acc.unitIds.add(row.unit_id);
      const grades = row.payload?.grade_history ?? [];
      const lastGrade = grades[grades.length - 1];
      if (typeof lastGrade === 'number') {
        const prev = acc.unitIdLastGrade.get(row.unit_id);
        if (prev == null || lastGrade > prev) {
          acc.unitIdLastGrade.set(row.unit_id, lastGrade);
        }
      }
    }
  }
}

export async function collectUnitIdsAndGrades(
  input: PromptContextInputLike,
): Promise<{
  unitIds: Set<string>;
  unitIdLastGrade: Map<string, number>;
}> {
  const acc = {
    unitIds: new Set<string>(),
    unitIdLastGrade: new Map<string, number>(),
  };
  await fillUnitIdsAndGrades(acc, input);
  return {
    unitIds: acc.unitIds,
    unitIdLastGrade: acc.unitIdLastGrade,
  };
}

export { getValidUnitIdsAndLabels } from './promptContextServiceValidUnits.ts';
export type { PromptContextResult } from './promptContextServiceHelpersResponse.ts';
export {
  buildFinalResponse,
} from './promptContextServiceHelpersResponse.ts';
