/**
 * rules:summary — print applicable store.md § for a task type.
 * Run: deno task rules:summary -- <task-type> [--code|--docs|--system]
 * Task types: feature | refactor | docs | commit | migration | system |
 *   dependency | sql | directory | all
 */

const STORE_PATH = "shared/prompt/store.md";

type TaskType =
  | "feature"
  | "refactor"
  | "docs"
  | "commit"
  | "migration"
  | "system"
  | "dependency"
  | "sql"
  | "directory"
  | "all";

const CONTEXT_TO_SECTIONS: Record<string, string> = {
  "always": "C, I, O",
  "handoff / long session": "B",
  "feature + code": "Q, P, B, S, T, N",
  "refactor + code": "P, B, S, T, N",
  "docs": "R, D, E",
  "commit": "A, B",
  "migration": "J, D, E, F",
  "system": "K, L, M, F",
  "dependency": "G, H",
  "sql": "U",
  "directory": "F, D, E",
};

const TASK_TO_CONTEXTS: Record<TaskType, string[]> = {
  feature: ["feature + code"],
  refactor: ["refactor + code"],
  docs: ["docs"],
  commit: ["commit"],
  migration: ["migration"],
  system: ["system"],
  dependency: ["dependency"],
  sql: ["sql"],
  directory: ["directory"],
  all: [
    "always",
    "handoff / long session",
    "feature + code",
    "refactor + code",
    "docs",
    "commit",
    "migration",
    "system",
    "dependency",
    "sql",
    "directory",
  ],
};

function parseSectionIds(applyCol: string): string[] {
  return applyCol.split(",").map((s) => s.trim().replace(/^§/, ""));
}

function collectSections(taskType: TaskType, layers: string[]): Set<string> {
  const contexts = TASK_TO_CONTEXTS[taskType];
  if (!contexts) return new Set();
  const add: string[] = [];
  for (const ctx of contexts) {
    const sec = CONTEXT_TO_SECTIONS[ctx];
    if (sec) add.push(...parseSectionIds(sec));
  }
  for (const layer of layers) {
    if (layer === "code" && taskType === "feature") {
      add.push(...parseSectionIds(CONTEXT_TO_SECTIONS["feature + code"] ?? ""));
    } else if (layer === "docs") {
      add.push(...parseSectionIds(CONTEXT_TO_SECTIONS["docs"] ?? ""));
    } else if (layer === "system") {
      add.push(...parseSectionIds(CONTEXT_TO_SECTIONS["system"] ?? ""));
    }
  }
  return new Set(add);
}

function parseSectionTitles(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^### (§[A-Z])\. (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    map.set(m[1].slice(1), m[2].trim());
  }
  return map;
}

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
    console.error(
      "Usage: deno run -A shared/prompt/scripts/rules-summary.ts <task-type> [--code|--docs|--system]",
    );
    console.error(
      "Task types: feature, refactor, docs, commit, migration, system, dependency, sql, directory, all",
    );
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
