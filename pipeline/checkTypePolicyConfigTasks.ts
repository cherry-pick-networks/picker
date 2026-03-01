//
// Type-check policy: deno.json tasks (no --no-check). Used by
// checkTypePolicy.ts.
//
import {
  DENO_JSON,
  DENO_JSONC,
} from './checkTypePolicyLib.ts';

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

function validateTasks(
  data: { tasks?: Record<string, string> },
): string[] {
  const errors: string[] = [];
  const tasks = data.tasks ?? {};
  for (const [name, script] of Object.entries(tasks)) {
    if (
      typeof script === 'string' &&
      script.includes('--no-check')
    ) {
      errors.push(
        `deno.json task "${name}" must not use --no-check`,
      );
    }
  }
  return errors;
}

export async function checkDenoJsonTasks(
  root: string,
): Promise<string[]> {
  const file = await readDenoJsonContent(root);
  if (!file) return [];
  try {
    const data = JSON.parse(file.content) as {
      tasks?: Record<string, string>;
    };
    return validateTasks(data);
  } catch {
    return [`${file.path}: invalid JSON`];
  }
}
