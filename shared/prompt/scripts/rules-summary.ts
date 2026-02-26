// function-length-ignore-file — CLI utility (store.md §P file-level ignore).
/**
 * rules:summary — print applicable store.md § for a task type.
 * Run: deno task rules:summary -- <task-type> [--code|--docs|--system]
 */
import {
  collectSections,
  parseSectionTitles,
  STORE_PATH,
  TASK_TO_CONTEXTS,
  type TaskType,
} from "./rules-summary-config.ts";

const USAGE =
  "Usage: deno run -A shared/prompt/scripts/rules-summary.ts <task-type> " +
  "[--code|--docs|--system]";
const TASK_TYPES =
  "Task types: feature, refactor, docs, commit, migration, system, " +
  "dependency, sql, directory, all";

function main(): void {
  const args = Deno.args.slice(0);
  const layers: string[] = [];
  let taskType: string | null = null;
  for (const a of args) {
    if (a === "--code" || a === "--docs" || a === "--system") {
      layers.push(a.slice(2));
    } else if (a.startsWith("--")) {
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
  const content = Deno.readTextFileSync(STORE_PATH);
  const titles = parseSectionTitles(content);
  const sectionIds = collectSections(taskType as TaskType, layers);
  const ordered = Array.from(sectionIds).sort();
  const sectionList = ordered.map((id) => `§${id}`).join(", ");
  console.log("Applicable sections:", sectionList);
  console.log("");
  for (const id of ordered) {
    const title = titles.get(id) ?? "(see store.md Part B)";
    console.log(`  §${id}. ${title}`);
  }
}

main();
