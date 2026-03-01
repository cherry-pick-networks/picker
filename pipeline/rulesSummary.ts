// function-length-ignore-file — CI/utility script (§P reserved).
//
// rules:summary — print applicable RULESET.md § for a task type.
// Run: deno task rules:summary -- <task-type> [--code|--docs|--system]
//
import { getPath } from './pathConfig.ts';
import {
  collectSections,
  parseSectionTitles,
  TASK_TO_CONTEXTS,
  type TaskType,
} from './rulesSummaryConfig.ts';

const USAGE =
  'Usage: deno task rules:summary -- <task-type> [--code|--docs|--system]';
const TASK_TYPES =
  'Task types: feature, refactor, docs, commit, migration, system, ' +
  'dependency, sql, directory, all';

function main(): void {
  const args = Deno.args.slice(0);
  const layers: string[] = [];
  let taskType: string | null = null;
  for (const a of args) {
    if (
      a === '--code' || a === '--docs' || a === '--system'
    ) {
      layers.push(a.slice(2));
    } else if (a.startsWith('--')) {
      continue;
    } else {
      taskType = a;
    }
  }
  if (!taskType || !(taskType in TASK_TO_CONTEXTS)) {
    console.error(USAGE);
    console.error(TASK_TYPES);
    Deno.exit(1);
  }
  const content = Deno.readTextFileSync(getPath('store'));
  const titles = parseSectionTitles(content);
  const sectionIds = collectSections(
    taskType as TaskType,
    layers,
  );
  const ordered = Array.from(sectionIds).sort();
  const sectionList = ordered.map((id) => `§${id}`).join(
    ', ',
  );
  console.log('Applicable sections:', sectionList);
  if (taskType === 'commit') {
    console.log('Skill: commit-boundary');
  }
  console.log('');
  for (const id of ordered) {
    const title = titles.get(id) ??
      '(see RULESET.md Part B)';
    console.log(`  §${id}. ${title}`);
  }
}

main();
