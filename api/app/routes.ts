//
// Single source of route list for main.ts registration.
// Todo-check validates this list against sharepoint/context/config/openapi.yaml.
//

import type { Hono } from 'hono';
import { requireEntraAuth } from '#api/app/authMiddleware.ts';
import {
  registerAstAndScripts,
  registerRestHandlers,
} from '#api/app/routesRegisterConfig.ts';

export { ROUTES } from './routesList.ts';

export function registerRoutes(app: Hono): void {
  app.use('*', (c, next) => {
    if (c.req.method === 'GET' && c.req.path === '/') {
      return next();
    }
    return requireEntraAuth(c, next);
  });
  registerRestHandlers(app);
  registerAstAndScripts(app);
}
