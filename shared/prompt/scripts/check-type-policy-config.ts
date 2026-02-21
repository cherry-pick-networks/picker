/**
 * Type-check policy: deno.json tasks and compiler options.
 * Used by check-type-policy.ts.
 */

import { DENO_JSON, DENO_JSONC, TSCONFIG } from "./check-type-policy-lib.ts";

export async function checkDenoJsonTasks(root: string): Promise<string[]> {
  const errors: string[] = [];
  let content: string;
  let path = `${root}/${DENO_JSON}`;
  try {
    content = await Deno.readTextFile(path);
  } catch {
    try {
      path = `${root}/${DENO_JSONC}`;
      content = await Deno.readTextFile(path);
    } catch {
      return errors; // no config
    }
  }
  let data: { tasks?: Record<string, string> };
  try {
    data = JSON.parse(content) as { tasks?: Record<string, string> };
  } catch {
    errors.push(`${path}: invalid JSON`);
    return errors;
  }
  const tasks = data.tasks ?? {};
  for (const [name, script] of Object.entries(tasks)) {
    if (typeof script === "string" && script.includes("--no-check")) {
      errors.push(`deno.json task "${name}" must not use --no-check`);
    }
  }
  return errors;
}

export async function checkCompilerOptions(root: string): Promise<string[]> {
  const errors: string[] = [];
  const check = (path: string, opts: Record<string, unknown> | undefined) => {
    if (!opts || typeof opts !== "object") return;
    if (opts.skipLibCheck === true) {
      errors.push(`${path}: compilerOptions.skipLibCheck must not be true`);
    }
    if (opts.strict === false) {
      errors.push(`${path}: compilerOptions.strict must not be false`);
    }
  };
  for (const configFile of [DENO_JSON, DENO_JSONC, TSCONFIG]) {
    const path = `${root}/${configFile}`;
    let content: string;
    try {
      content = await Deno.readTextFile(path);
    } catch {
      continue;
    }
    try {
      const data = JSON.parse(content) as {
        compilerOptions?: Record<string, unknown>;
      };
      check(path, data.compilerOptions);
    } catch {
      // ignore parse errors; other tooling will report
    }
  }
  return errors;
}
