//
// Type-check policy: compiler options (no skipLibCheck/strict false).
// Used by checkTypePolicy.ts.
//
import {
  DENO_JSON,
  DENO_JSONC,
  TSCONFIG,
} from './checkTypePolicyLib.ts';

type CompilerOptionsData = {
  compilerOptions?: Record<string, unknown>;
};

function checkOneOpts(
  path: string,
  opts: Record<string, unknown> | undefined,
  errors: string[],
): void {
  if (!opts || typeof opts !== 'object') return;
  if (opts.skipLibCheck === true) {
    errors.push(
      `${path}: compilerOptions.skipLibCheck must not be true`,
    );
  }
  if (opts.strict === false) {
    errors.push(
      `${path}: compilerOptions.strict must not be false`,
    );
  }
}

async function readOneConfig(
  root: string,
  configFile: string,
): Promise<
  { path: string; data: CompilerOptionsData } | null
> {
  const path = `${root}/${configFile}`;
  try {
    const content = await Deno.readTextFile(path);
    const data = JSON.parse(content) as CompilerOptionsData;
    return { path, data };
  } catch {
    return null;
  }
}

export async function checkCompilerOptions(
  root: string,
): Promise<string[]> {
  const errors: string[] = [];
  for (
    const configFile of [DENO_JSON, DENO_JSONC, TSCONFIG]
  ) {
    const one = await readOneConfig(root, configFile);
    if (one) {
      checkOneOpts(
        one.path,
        one.data.compilerOptions,
        errors,
      );
    }
  }
  return errors;
}
