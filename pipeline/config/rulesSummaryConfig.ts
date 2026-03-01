// function-length-ignore-file — CI/utility script (§P reserved).
//
// Config and helpers for rulesSummary.ts (RULESET.md Rule index → § list).
// Ruleset path: use getPath('store') from pathConfig.ts (config/path-config.json paths).
//

export type { TaskType } from './rulesSummaryConfigMaps.ts';
export {
  CONTEXT_TO_SECTIONS,
  parseSectionIds,
  TASK_TO_CONTEXTS,
} from './rulesSummaryConfigMaps.ts';

import {
  CONTEXT_TO_SECTIONS,
  parseSectionIds,
  TASK_TO_CONTEXTS,
} from './rulesSummaryConfigMaps.ts';
import type { TaskType } from './rulesSummaryConfigMaps.ts';

export function collectSections(
  taskType: TaskType,
  layers: string[],
): Set<string> {
  const contexts = TASK_TO_CONTEXTS[taskType];
  if (!contexts) return new Set();
  const add: string[] = [];
  for (const ctx of contexts) {
    const sec = CONTEXT_TO_SECTIONS[ctx];
    if (sec) add.push(...parseSectionIds(sec));
  }
  for (const layer of layers) {
    if (layer === 'code' && taskType === 'feature') {
      add.push(
        ...parseSectionIds(
          CONTEXT_TO_SECTIONS['feature + code'] ?? '',
        ),
      );
    } else if (layer === 'docs') {
      add.push(
        ...parseSectionIds(
          CONTEXT_TO_SECTIONS['docs'] ?? '',
        ),
      );
    } else if (layer === 'system') {
      add.push(
        ...parseSectionIds(
          CONTEXT_TO_SECTIONS['system'] ?? '',
        ),
      );
    }
  }
  return new Set(add);
}

export function parseSectionTitles(
  content: string,
): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^### (§[A-Z])\. (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    map.set(m[1].slice(1), m[2].trim());
  }
  return map;
}
