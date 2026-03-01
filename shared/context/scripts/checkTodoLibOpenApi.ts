//
// OpenAPI path parsing for todo check. Used by checkTodoLib.ts.
//

export type Route = { method: string; path: string };

const OPENAPI_HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
] as const;

export function openApiPathToHono(
  openApiPath: string,
): string {
  if (
    openApiPath.includes('{path}') &&
    openApiPath.startsWith('/scripts')
  ) {
    return openApiPath.replace(/\{path\}/g, ':path*');
  }
  return openApiPath.replace(/\{([^}]+)\}/g, ':$1');
}

function addPathItemRoutes(
  routes: Route[],
  pathTemplate: string,
  pathItem: Record<string, unknown>,
): void {
  const path = openApiPathToHono(pathTemplate);
  for (const method of OPENAPI_HTTP_METHODS) {
    if (method in pathItem && pathItem[method] != null) {
      routes.push({
        method: method.toUpperCase(),
        path,
      });
    }
  }
}

export function parseOpenApiPaths(spec: {
  paths?: Record<string, Record<string, unknown>>;
}): Route[] {
  if (!spec.paths || typeof spec.paths !== 'object') {
    return [];
  }
  const routes: Route[] = [];
  for (
    const [pathTemplate, pathItem] of Object.entries(
      spec.paths,
    )
  ) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    addPathItemRoutes(routes, pathTemplate, pathItem);
  }
  return routes;
}
