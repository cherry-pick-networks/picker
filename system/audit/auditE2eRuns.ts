/**
 * E2E run artifacts under system/audit/ (e2e-runs.toml); not served.
 */

import { readTomlFile, writeTomlFile } from '#system/record/tomlService.ts';

const LOG_DIR = new URL('.', import.meta.url).pathname;
const E2E_RUNS_PATH = `${LOG_DIR}e2e-runs.toml`;
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
  const out = LOG_DIR;
  return out;
}

export function getE2eRunsPath(): string {
  const out = E2E_RUNS_PATH;
  return out;
}

function normalizeRuns(data: E2ERunsFile): E2ERunsFile {
  if (!data.runs || !Array.isArray(data.runs)) {
    return { schemaVersion: data.schemaVersion ?? 1, runs: [] };
  }
  return data;
}

export async function readE2eRuns(): Promise<E2ERunsFile> {
  const data = await readTomlFile<E2ERunsFile>(E2E_RUNS_PATH);
  return data !== null ? normalizeRuns(data) : { schemaVersion: 1, runs: [] };
}

// function-length-ignore
function trimRunsToMax(data: E2ERunsFile): void {
  if (data.runs.length > MAX_RUNS) {
    data.runs = data.runs.slice(-MAX_RUNS);
  }
}

export async function appendE2eRun(entry: E2ERunEntry): Promise<void> {
  const data = await readE2eRuns();
  data.runs.push(entry);
  trimRunsToMax(data);
  await writeTomlFile(E2E_RUNS_PATH, data as Record<string, unknown>);
}
