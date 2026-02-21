/**
 * Type-check policy: fail if type checking is disabled or bypassed.
 * Checks: (A) no --no-check in deno.json tasks, (B) no @ts-ignore or
 * @ts-expect-error in source, (D) no skipLibCheck/strict disabled in config.
 * Run from repo root: deno run --allow-read shared/prompt/scripts/check-type-policy.ts
 * Or: deno task type-check-policy
 */

import {
  checkCompilerOptions,
  checkDenoJsonTasks,
} from "./check-type-policy-config.ts";
import { checkSourceFile, walkSourceFiles } from "./check-type-policy-lib.ts";

async function main(): Promise<void> {
  const root = Deno.cwd();
  const allErrors: string[] = [];

  const taskErrors = await checkDenoJsonTasks(root);
  allErrors.push(...taskErrors);

  const optErrors = await checkCompilerOptions(root);
  allErrors.push(...optErrors);

  const sourceFiles = await walkSourceFiles(root, root);
  for (const rel of sourceFiles) {
    const content = await Deno.readTextFile(`${root}/${rel}`);
    const fileErrors = checkSourceFile(rel, content);
    allErrors.push(...fileErrors);
  }

  if (allErrors.length > 0) {
    console.error(
      "Type-check policy violation(s). See §N in shared/prompt/store.md.",
    );
    for (const e of allErrors) console.error("  " + e);
    Deno.exit(1);
  }

  console.log("Type-check policy passed: no bypass or disable detected.");
}

main();
