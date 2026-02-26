// function-length-ignore-file — shared with rules-summary.ts CLI (store.md §P).
/**
 * Config and helpers for rules-summary.ts (store.md Rule index → § list).
 */

export const STORE_PATH = "shared/prompt/store.md";

export type TaskType =
  | "feature"
  | "refactor"
  | "docs"
  | "commit"
  | "migration"
  | "system"
  | "dependency"
  | "sql"
  | "directory"
  | "seed"
  | "all";

export const CONTEXT_TO_SECTIONS: Record<string, string> = {
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
  "seed": "V, U, E",
};

export const TASK_TO_CONTEXTS: Record<TaskType, string[]> = {
  feature: ["feature + code"],
  refactor: ["refactor + code"],
  docs: ["docs"],
  commit: ["commit"],
  migration: ["migration"],
  system: ["system"],
  dependency: ["dependency"],
  sql: ["sql"],
  directory: ["directory"],
  seed: ["seed"],
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
    "seed",
  ],
};

function parseSectionIds(applyCol: string): string[] {
  return applyCol.split(",").map((s) => s.trim().replace(/^§/, ""));
}

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

export function parseSectionTitles(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^### (§[A-Z])\. (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    map.set(m[1].slice(1), m[2].trim());
  }
  return map;
}
