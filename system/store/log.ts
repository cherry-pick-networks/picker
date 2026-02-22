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

function parseE2eRunsRaw(raw: string): E2ERunsFile {
  const data = JSON.parse(raw) as E2ERunsFile;
  return normalizeRuns(data);
}

const readE2eRunsFile = (): Promise<string | null> =>
  Deno.readTextFile(E2E_RUNS_PATH).then((s) => s).catch(() => null);

async function readE2eRunsRaw(): Promise<string | null> {
  const raw = await readE2eRunsFile();
  return raw;
}

export async function readE2eRuns(): Promise<E2ERunsFile> {
  const raw = await readE2eRunsRaw();
  return raw !== null ? parseE2eRunsRaw(raw) : { schemaVersion: 1, runs: [] };
}

function trimRunsToMax(data: E2ERunsFile): void {
  if (data.runs.length > MAX_RUNS) {
    data.runs = data.runs.slice(-MAX_RUNS);
  }
}

export async function appendE2eRun(entry: E2ERunEntry): Promise<void> {
  const data = await readE2eRuns();
  data.runs.push(entry);
  trimRunsToMax(data);
  await Deno.writeTextFile(E2E_RUNS_PATH, JSON.stringify(data, null, 2));
}
