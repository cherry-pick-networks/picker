/**
 * Run E2E tests and append one run entry to system/audit/e2e-runs.toml.
 * Usage: deno run -A shared/prompt/scripts/run-e2e-record.ts
 * Or: deno task test:e2e-record
 */

import { appendE2eRun } from '#system/audit/auditE2eRuns.ts';

const E2E_TEST_FILE = 'tests/system/mainE2e_test.ts';

// function-length-ignore
function nowIso(): string {
  return new Date().toISOString();
}

// function-length-ignore
async function main(): Promise<void> {
  const runId = `run-${Date.now()}`;
  const startedAt = nowIso();

  const proc = new Deno.Command(Deno.execPath(), {
    args: [
      'test',
      '-A',
      E2E_TEST_FILE,
    ],
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const child = proc.spawn();
  const status = await child.status;
  const finishedAt = nowIso();
  const ok = status.code === 0;

  await appendE2eRun({
    id: runId,
    startedAt,
    finishedAt,
    summary: { passed: ok ? 1 : 0, failed: ok ? 0 : 1 },
    suite: 'e2e',
    env: Deno.env.get('CI') ? 'ci' : 'local',
  });

  Deno.exit(status.code);
}

main();
