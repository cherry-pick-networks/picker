//
// OpenAPI routes for report/teams (APIs 41–50).
// Registers GET /report/teams/* with createRoute + handler.
//

import type { OpenAPIHono } from '@hono/zod-openapi';
import { reportRouteHandlersPart1 } from './reportOpenApiRoutesPart1.ts';
import { reportRouteHandlersPart2 } from './reportOpenApiRoutesPart2.ts';

export function registerReportTeamsOpenApi(
  app: OpenAPIHono,
): void {
  const handlers = [
    ...reportRouteHandlersPart1,
    ...reportRouteHandlersPart2,
  ];
  for (const { route, get } of handlers) {
    app.openapi(route, async (c) => {
      const q = (c.req.valid as (key: 'query') => unknown)(
        'query',
      );
      return c.json(await get(q));
    });
  }
}
