import { parse } from '@std/semver/parse';
import { setAllowlistLoader } from '#api/config/allowlistData.ts';
import { loadAllowlistData } from '#api/config/conceptStore.ts';
import type { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { registerOpenApiRoutes } from '#api/app/openApiRoutes.ts';
import { registerRoutes } from '#api/app/routes.ts';

setAllowlistLoader(loadAllowlistData);
const API_VERSION = '1.0.0';
parse(API_VERSION);
const app = new OpenAPIHono();
app.doc('/doc', {
  openapi: '3.0.3',
  info: { title: 'Picker API', version: API_VERSION },
});
registerRoutes(app as unknown as Hono);
registerOpenApiRoutes(app);

if (import.meta.main) {
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

export { app };
