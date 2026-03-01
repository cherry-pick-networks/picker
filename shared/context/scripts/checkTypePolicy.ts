//
// Type-check policy: fail if type checking is disabled or bypassed.
// Checks: (A) no --no-check in deno.json tasks, (B) no @ts-ignore or
// @ts-expect-error in source, (D) no skipLibCheck/strict disabled in config.
// Run: deno task type-check-policy
// Or: deno task type-check-policy
//
import { checkCompilerOptions } from './checkTypePolicyConfigCompiler.ts';
import { checkDenoJsonTasks } from './checkTypePolicyConfigTasks.ts';
import {
  checkSourceFile,
  walkSourceFiles,
} from './checkTypePolicyLib.ts';

async function collectSourceErrors(
  root: string,
): Promise<string[]> {
  const sourceFiles = await walkSourceFiles(root, root);
  const errors: string[] = [];
  for (const rel of sourceFiles) {
    const content = await Deno.readTextFile(
      `${root}/${rel}`,
    );
    errors.push(...checkSourceFile(rel, content));
  }
  return errors;
}

async function runChecks(): Promise<string[]> {
  const root = Deno.cwd();
  const [taskErrors, optErrors, sourceErrors] =
    await Promise.all([
      checkDenoJsonTasks(root),
      checkCompilerOptions(root),
      collectSourceErrors(root),
    ]);
  return [...taskErrors, ...optErrors, ...sourceErrors];
}

async function main(): Promise<void> {
  const allErrors = await runChecks();
  if (allErrors.length > 0) {
    console.error(
      'Type-check policy violation(s). See §N in shared/context/RULESET.md.',
    );
    for (const e of allErrors) console.error('  ' + e);
    Deno.exit(1);
  }
  console.log(
    'Type-check policy passed: no bypass or disable detected.',
  );
}

main();
