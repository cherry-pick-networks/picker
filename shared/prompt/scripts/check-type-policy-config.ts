/**
 * Type-check policy: deno.json tasks and compiler options.
 * Used by check-type-policy.ts.
 */

import { DENO_JSON, DENO_JSONC, TSCONFIG } from './check-type-policy-lib.ts';

async function readDenoJsonContent(
  root: string,
): Promise<{ path: string; content: string } | null> {
  const path = `${root}/${DENO_JSON}`;
  try {
    const content = await Deno.readTextFile(path);
    return { path, content };
  } catch {
    const pathC = `${root}/${DENO_JSONC}`;
    try {
      const content = await Deno.readTextFile(pathC);
      return { path: pathC, content };
    } catch {
      return null;
    }
  }
}

function validateTasks(data: { tasks?: Record<string, string> }): string[] {
  const errors: string[] = [];
  const tasks = data.tasks ?? {};
  for (const [name, script] of Object.entries(tasks)) {
    if (typeof script === 'string' && script.includes('--no-check')) {
      errors.push(`deno.json task "${name}" must not use --no-check`);
    }
  }
  return errors;
}

export async function checkDenoJsonTasks(root: string): Promise<string[]> {
  const file = await readDenoJsonContent(root);
  if (!file) return [];
  try {
    const data = JSON.parse(file.content) as { tasks?: Record<string, string> };
    return validateTasks(data);
  } catch {
    return [`${file.path}: invalid JSON`];
  }
}

function checkOneOpts(
  path: string,
  opts: Record<string, unknown> | undefined,
  errors: string[],
): void {
  if (!opts || typeof opts !== 'object') return;
  if (opts.skipLibCheck === true) {
    errors.push(`${path}: compilerOptions.skipLibCheck must not be true`);
  }
  if (opts.strict === false) {
    errors.push(`${path}: compilerOptions.strict must not be false`);
  }
}

type CompilerOptionsData = { compilerOptions?: Record<string, unknown> };

async function readOneConfig(
  root: string,
  configFile: string,
): Promise<{ path: string; data: CompilerOptionsData } | null> {
  const path = `${root}/${configFile}`;
  try {
    const content = await Deno.readTextFile(path);
    const data = JSON.parse(content) as CompilerOptionsData;
    return { path, data };
  } catch {
    return null;
  }
}

export async function checkCompilerOptions(root: string): Promise<string[]> {
  const errors: string[] = [];
  for (const configFile of [DENO_JSON, DENO_JSONC, TSCONFIG]) {
    const one = await readOneConfig(root, configFile);
    if (one) checkOneOpts(one.path, one.data.compilerOptions, errors);
  }
  return errors;
}
