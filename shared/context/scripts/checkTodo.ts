//
// Todo check: fail if code registers API routes not listed in openapi.yaml.
// Reads route list from system/routes.ts; allowlist from openapi.yaml paths.
// Run: deno task todo-check
//
import {
  parseOpenApiPaths,
  routeKey,
} from './checkTodoLib.ts';
import { ROUTES } from '#system/routes.ts';
import { getPath } from './pathConfig.ts';
import { parse } from '@std/yaml';

function getOpenApiPath(): string {
  const root = Deno.cwd();
  const docs = getPath('contextDocs');
  return `${root}/${docs}/openapi.yaml`;
}

async function loadAllowedRoutes(
  openApiPath: string,
): Promise<Set<string>> {
  const content = await Deno.readTextFile(openApiPath);
  const spec = parse(content) as Parameters<
    typeof parseOpenApiPaths
  >[0];
  const routes = parseOpenApiPaths(spec).map(routeKey);
  return new Set(routes);
}

async function runTodoCheck(openApiPath: string): Promise<{
  allowed: Set<string>;
  missing: typeof ROUTES;
}> {
  const allowed = await loadAllowedRoutes(openApiPath);
  const missing = ROUTES.filter((r) =>
    !allowed.has(routeKey(r))
  );
  return { allowed, missing };
}

function reportIfFailed(result: {
  allowed: Set<string>;
  missing: typeof ROUTES;
}): void {
  if (result.allowed.size === 0) {
    console.error(
      'No API routes found in openapi.yaml paths. Check the file format.',
    );
    Deno.exit(1);
  }
  if (result.missing.length > 0) {
    console.error(
      'Routes in code not in openapi.yaml. Add to openapi.yaml paths first.',
    );
    for (const r of result.missing) {
      console.error(`  ${r.method} ${r.path}`);
    }
    Deno.exit(1);
  }
}

async function main(): Promise<void> {
  const openApiPath = getOpenApiPath();
  try {
    const result = await runTodoCheck(openApiPath);
    reportIfFailed(result);
  } catch (e) {
    console.error(
      `Cannot read openapi file: ${openApiPath}`,
      e,
    );
    Deno.exit(1);
  }
  console.log(
    'Todo check passed: all routes are listed in openapi.yaml.',
  );
}

main();
