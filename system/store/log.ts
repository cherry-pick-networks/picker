/**
 * Log artifact storage under system/log/. Written by tests or tooling; not
 * served by API. See shared/prompt/boundary.md (system/log/).
 */

const LOG_DIR = new URL("../log/", import.meta.url).pathname;
const E2E_RUNS_PATH = `${LOG_DIR}e2e-runs.json`;
const MAX_RUNS = 20;

export interface E2ERunSummary {
  passed: number;
  failed: number;
  skipped?: number;
}

export interface E2ERunEntry {
  id: string;
  startedAt: string;
  finishedAt?: string;
  summary: E2ERunSummary;
  suite?: string;
  env?: string;
}

export interface E2ERunsFile {
  schemaVersion: number;
  runs: E2ERunEntry[];
}

export function getLogDir(): string {
  return LOG_DIR;
}

export function getE2eRunsPath(): string {
  return E2E_RUNS_PATH;
}

export async function readE2eRuns(): Promise<E2ERunsFile> {
  let raw: string;
  try {
    raw = await Deno.readTextFile(E2E_RUNS_PATH);
  } catch {
    return { schemaVersion: 1, runs: [] };
  }
  const data = JSON.parse(raw) as E2ERunsFile;
  if (!data.runs || !Array.isArray(data.runs)) {
    return { schemaVersion: data.schemaVersion ?? 1, runs: [] };
  }
  return data;
}

export async function appendE2eRun(entry: E2ERunEntry): Promise<void> {
  const data = await readE2eRuns();
  data.runs.push(entry);
  if (data.runs.length > MAX_RUNS) {
    data.runs = data.runs.slice(-MAX_RUNS);
  }
  await Deno.writeTextFile(E2E_RUNS_PATH, JSON.stringify(data, null, 2));
}
