// One-off: rewrite linear history so merge commits (2 parents) appear at
// conventional-commit type boundaries (Option B work instruction).
// Works on a new branch only; current branch is left unchanged.
// Limitation: uses --first-parent only; side branches merged in are not included.
// Requires a clean working tree (commit or stash first) unless --dry-run.
// Run from repo root: deno run -A sharepoint/context/scripts/rewriteMergeAtTagBoundaries.ts
// [--dry-run] [--all | -n N] [--branch <result-branch>] [--overwrite]

function ignoreError(_e: unknown): void {
  void _e;
  return;
}

function parseType(subject: string): string {
  const m = subject.match(/^(\w+)(?:\([^)]*\))?:\s/);
  if (m) return m[1].toLowerCase();
  if (/^Merge\s/i.test(subject)) return 'merge';
  return 'other';
}

async function runGit(
  args: string[],
  opts?: { cwd?: string; inherit?: boolean },
): Promise<{ out: Deno.CommandOutput; inherit: boolean }> {
  const inherit = opts?.inherit ?? false;
  const c = new Deno.Command('git', {
    args,
    cwd: opts?.cwd ?? Deno.cwd(),
    stdout: inherit ? 'inherit' : 'piped',
    stderr: inherit ? 'inherit' : 'piped',
  });
  const out = await c.output();
  return { out, inherit };
}

function throwIfFailed(
  out: Deno.CommandOutput,
  args: string[],
  inherit: boolean,
): void {
  if (out.success) return;
  if (!inherit) {
    const err = new TextDecoder().decode(out.stderr);
    throw new Error(`git ${args.join(' ')} failed: ${err}`);
  }
  throw new Error(
    `git ${args.join(' ')} exited ${out.code}`,
  );
}

async function git(
  args: string[],
  opts?: { cwd?: string; inherit?: boolean },
): Promise<string> {
  const { out, inherit } = await runGit(args, opts);
  throwIfFailed(out, args, inherit);
  return inherit
    ? ''
    : new TextDecoder().decode(out.stdout).trim();
}

function getN(): number {
  const nIdx = Deno.args.indexOf('-n');
  return nIdx >= 0 && Deno.args[nIdx + 1]
    ? parseInt(Deno.args[nIdx + 1], 10)
    : 35;
}

function validateN(n: number, all: boolean): void {
  if (all || n >= 2) return;
  console.error('Use -n >= 2 or --all');
  Deno.exit(1);
}

function getBranchArg(): string | undefined {
  const i = Deno.args.indexOf('--branch');
  return i >= 0 && Deno.args[i + 1]
    ? Deno.args[i + 1]
    : undefined;
}

function parseArgs(): {
  dryRun: boolean;
  all: boolean;
  n: number;
  branch: string | undefined;
  overwrite: boolean;
} {
  const o = {
    dryRun: Deno.args.includes('--dry-run'),
    all: Deno.args.includes('--all'),
    n: getN(),
    branch: getBranchArg(),
    overwrite: Deno.args.includes('--overwrite'),
  };
  validateN(o.n, o.all);
  return o;
}

async function getRevList(
  all: boolean,
  n: number,
): Promise<string[]> {
  const revListArgs: string[] = [
    'rev-list',
    '--first-parent',
    'HEAD',
  ];
  if (!all) revListArgs.splice(2, 0, `-n${n}`);
  const revList = await git(revListArgs);
  return revList.split('\n').filter(Boolean).reverse();
}

function ensureEnoughRevs(revs: string[]): void {
  if (revs.length >= 2) return;
  console.log('Not enough commits to rewrite');
  Deno.exit(0);
}

async function getCommitInfo(rev: string): Promise<{
  rev: string;
  subject: string;
  type: string;
}> {
  const subject = await git([
    'log',
    '-1',
    '--format=%s',
    rev,
  ]);
  const type = parseType(subject);
  return { rev, subject, type };
}

async function loadCommits(revs: string[]): Promise<
  { rev: string; subject: string; type: string }[]
> {
  const commits: {
    rev: string;
    subject: string;
    type: string;
  }[] = [];
  for (const rev of revs) {
    commits.push(await getCommitInfo(rev));
  }
  return commits;
}

function fillSegments(
  commits: { rev: string; type: string }[],
  segments: { type: string; revs: string[] }[],
  cur: { type: string; revs: string[] },
): { type: string; revs: string[] } {
  let current = cur;
  for (let i = 1; i < commits.length; i++) {
    if (commits[i].type === current.type) {
      current.revs.push(commits[i].rev);
    } else {
      segments.push(current);
      current = {
        type: commits[i].type,
        revs: [commits[i].rev],
      };
    }
  }
  return current;
}

function buildSegmentsFrom(
  commits: { rev: string; type: string }[],
  cur: { type: string; revs: string[] },
): { type: string; revs: string[] }[] {
  const segments: { type: string; revs: string[] }[] = [];
  const finalCurrent = fillSegments(commits, segments, cur);
  segments.push(finalCurrent);
  return segments;
}

function buildSegments(
  commits: { rev: string; type: string }[],
): {
  type: string;
  revs: string[];
}[] {
  const cur = {
    type: commits[0].type,
    revs: [commits[0].rev],
  };
  return buildSegmentsFrom(commits, cur);
}

function ensureMultipleSegments(
  segments: { type: string; revs: string[] }[],
): void {
  if (segments.length > 1) return;
  console.log(
    'Single segment (no type boundaries); nothing to do',
  );
  Deno.exit(0);
}

const DEFAULT_RESULT_BRANCH = 'refactor/merge-at-tag-boundaries';

async function getCurrentBranchName(): Promise<string> {
  const raw = await git(['branch', '--show-current']);
  return raw.trim() || 'main';
}

function getResultBranchName(
  explicitBranch: string | undefined,
): string {
  return explicitBranch ?? DEFAULT_RESULT_BRANCH;
}

async function getBase(revs: string[]): Promise<string> {
  try {
    return await git(['rev-parse', `${revs[0]}^`]);
  } catch {
    return revs[0];
  }
}

function logSegments(
  segments: { type: string; revs: string[] }[],
): void {
  console.log(`Segments (${segments.length}):`);
  for (const s of segments) {
    console.log(`  ${s.type}: ${s.revs.length} commit(s)`);
  }
}

function logDryRun(
  base: string,
  segments: { type: string; revs: string[] }[],
  resultBranch: string,
  currentBranch: string,
): void {
  console.log(
    'Dry run: would create branch',
    resultBranch,
    'at base',
    base.slice(0, 7),
    'and apply',
    segments.length,
    'segments with merge commits.',
  );
  console.log('Current branch', currentBranch, 'would be unchanged.');
  Deno.exit(0);
}

async function cleanupTempBranches(): Promise<void> {
  const list = (await git(['branch'])).split('\n').map((
    s,
  ) => s.replace(/^\*?\s+/, '').trim()).filter((s) =>
    s.startsWith('seg') || s === 'mainline'
  );
  for (const b of list) {
    await git(['branch', '-D', b]).catch(ignoreError);
  }
}

async function applyFirstWhenBaseIsRev0(
  segments: { type: string; revs: string[] }[],
  revs: string[],
  tip1: string,
  firstSegmentHasMultiple: boolean,
): Promise<void> {
  if (firstSegmentHasMultiple) {
    await git(['branch', 'seg0', tip1]);
    await git(['reset', '--hard', revs[0]]);
    await git(
      [
        'merge',
        '--no-ff',
        '-m',
        `merge: ${
          segments[0].type
        } segment at tag boundary`,
        'seg0',
      ],
      { inherit: true },
    );
    await git(['branch', '-D', 'seg0']);
  } else {
    await git(['reset', '--hard', tip1]);
  }
}

async function createAndRebaseMainline(
  tip1: string,
  base: string,
): Promise<void> {
  await git(['branch', 'mainline', tip1]);
  await git(['checkout', 'mainline']);
  await git(['rebase', '--onto', base, base, 'mainline'], {
    inherit: true,
  });
}

async function checkoutAndResetTo(
  branchName: string,
  mainlineTip: string,
): Promise<void> {
  await git(['checkout', branchName]);
  await git(['reset', '--hard', mainlineTip]);
}

async function applyFirstWhenBaseIsNotRev0(
  tip1: string,
  base: string,
  branchName: string,
): Promise<void> {
  await createAndRebaseMainline(tip1, base);
  const mainlineTip = await git(['rev-parse', 'mainline']);
  await checkoutAndResetTo(branchName, mainlineTip);
}

async function applyFirstSegment(
  segments: { type: string; revs: string[] }[],
  revs: string[],
  branchName: string,
  base: string,
  tip1: string,
): Promise<void> {
  const firstSegmentHasMultiple =
    segments[0].revs.length >= 2;
  if (base === revs[0]) {
    await applyFirstWhenBaseIsRev0(
      segments,
      revs,
      tip1,
      firstSegmentHasMultiple,
    );
  } else {
    await applyFirstWhenBaseIsNotRev0(
      tip1,
      base,
      branchName,
    );
  }
}

function getSegmentMeta(
  i: number,
  segments: { type: string; revs: string[] }[],
): {
  seg: { type: string; revs: string[] };
  segTip: string;
  segBranch: string;
} {
  const seg = segments[i];
  return {
    seg,
    segTip: seg.revs[seg.revs.length - 1],
    segBranch: `seg${i}`,
  };
}

async function rebaseSegment(
  segBranch: string,
  segTip: string,
  branchName: string,
  prevTipOriginal: string,
): Promise<void> {
  await git(['branch', segBranch, segTip]);
  await git(
    [
      'rebase',
      '--onto',
      branchName,
      prevTipOriginal,
      segBranch,
    ],
    { inherit: true },
  );
}

async function mergeSegmentAndDeleteBranch(
  seg: { type: string; revs: string[] },
  segBranch: string,
  branchName: string,
): Promise<void> {
  await git(['checkout', branchName]);
  await git(
    [
      'merge',
      '--no-ff',
      '-m',
      `merge: ${seg.type} segment at tag boundary`,
      segBranch,
    ],
    { inherit: true },
  );
  await git(['branch', '-D', segBranch]);
}

async function applyOneSegment(
  i: number,
  segments: { type: string; revs: string[] }[],
  branchName: string,
  prevTipOriginal: string,
): Promise<void> {
  const { seg, segTip, segBranch } = getSegmentMeta(
    i,
    segments,
  );
  await rebaseSegment(
    segBranch,
    segTip,
    branchName,
    prevTipOriginal,
  );
  await mergeSegmentAndDeleteBranch(
    seg,
    segBranch,
    branchName,
  );
}

async function applySegmentLoop(
  segments: { type: string; revs: string[] }[],
  branchName: string,
  tip1: string,
): Promise<void> {
  let prevTipOriginal = tip1;
  for (let i = 1; i < segments.length; i++) {
    await applyOneSegment(
      i,
      segments,
      branchName,
      prevTipOriginal,
    );
    prevTipOriginal =
      segments[i].revs[segments[i].revs.length - 1];
  }
}

async function getRevsAndCommits(opts: {
  all: boolean;
  n: number;
}): Promise<
  {
    revs: string[];
    commits: {
      rev: string;
      subject: string;
      type: string;
    }[];
  }
> {
  const revs = await getRevList(opts.all, opts.n);
  ensureEnoughRevs(revs);
  const commits = await loadCommits(revs);
  return { revs, commits };
}

async function loadState(opts: {
  all: boolean;
  n: number;
}): Promise<
  {
    revs: string[];
    segments: { type: string; revs: string[] }[];
  }
> {
  const { revs, commits } = await getRevsAndCommits(opts);
  const segments = buildSegments(commits);
  ensureMultipleSegments(segments);
  return { revs, segments };
}

async function requireCleanWorkingTree(): Promise<void> {
  const out = await git(['status', '--porcelain']);
  if (out.length > 0) {
    console.error(
      'Working tree has uncommitted changes. Commit or stash them first.',
    );
    Deno.exit(1);
  }
}

async function runIfNotDryRun(
  opts: {
    dryRun: boolean;
    branch: string | undefined;
    overwrite: boolean;
  },
  revs: string[],
  segments: { type: string; revs: string[] }[],
): Promise<void> {
  const currentBranch = await getCurrentBranchName();
  const resultBranch = getResultBranchName(opts.branch);
  const base = await getBase(revs);
  if (opts.dryRun) {
    logDryRun(base, segments, resultBranch, currentBranch);
  } else {
    await requireCleanWorkingTree();
    await runRewrite(
      revs,
      segments,
      currentBranch,
      resultBranch,
      base,
      opts.overwrite,
    );
  }
}

async function logDone(
  resultBranch: string,
  resultTip: string,
  currentBranch: string,
): Promise<void> {
  console.log(
    'Done. Branch',
    resultBranch,
    'now has merge commits at type boundaries.',
  );
  console.log('Tip:', resultTip);
  console.log('Current branch', currentBranch, 'unchanged. To use: git checkout', resultBranch);
}

async function branchExists(branch: string): Promise<boolean> {
  const { out } = await runGit(['rev-parse', '--verify', branch]);
  return out.success;
}

async function createAndCheckoutResultBranch(
  resultBranch: string,
  base: string,
  overwrite: boolean,
): Promise<void> {
  if (await branchExists(resultBranch)) {
    if (overwrite) {
      await git(['branch', '-D', resultBranch]);
    } else {
      console.error(
        'Branch',
        resultBranch,
        'already exists. Delete it, use --branch <other>, or pass --overwrite.',
      );
      Deno.exit(1);
    }
  }
  await git(['checkout', '-b', resultBranch, base]);
  await cleanupTempBranches();
}

async function doApplyAndLoop(
  revs: string[],
  segments: { type: string; revs: string[] }[],
  branchName: string,
  base: string,
): Promise<void> {
  const tip1 =
    segments[0].revs[segments[0].revs.length - 1];
  await applyFirstSegment(
    segments,
    revs,
    branchName,
    base,
    tip1,
  );
  await git(['branch', '-D', 'mainline']).catch(
    ignoreError,
  );
  await applySegmentLoop(segments, branchName, tip1);
}

function printRecoveryInstructions(
  currentBranch: string,
  resultBranch: string,
): void {
  console.error('');
  console.error(
    'If rebase/merge failed mid-run, recover with:',
  );
  console.error('  git rebase --abort   # if rebase was in progress');
  console.error('  git merge --abort    # if merge was in progress');
  console.error('  git checkout', currentBranch);
  console.error(
    '  git branch -D',
    resultBranch,
    'mainline  # and any seg* branches (seg0, seg1, ...)',
  );
  console.error('');
}

async function runRewrite(
  revs: string[],
  segments: { type: string; revs: string[] }[],
  currentBranch: string,
  resultBranch: string,
  base: string,
  overwrite: boolean,
): Promise<void> {
  try {
    await createAndCheckoutResultBranch(resultBranch, base, overwrite);
    await doApplyAndLoop(revs, segments, resultBranch, base);
    const resultTip = await git(['rev-parse', 'HEAD']);
    await git(['checkout', currentBranch]);
    await logDone(resultBranch, resultTip, currentBranch);
  } catch (e) {
    printRecoveryInstructions(currentBranch, resultBranch);
    throw e;
  }
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const { revs, segments } = await loadState(opts);
  logSegments(segments);
  await runIfNotDryRun(opts, revs, segments);
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
