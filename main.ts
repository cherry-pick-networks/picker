import { setAllowlistLoader } from '#system/governance/allowlistData.ts';
import { loadAllowlistData } from '#system/governance/conceptStore.ts';
import type { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { registerOpenApiRoutes } from '#system/app/openApiRoutes.ts';
import { registerRoutes } from '#system/routes.ts';

setAllowlistLoader(loadAllowlistData);
const app = new OpenAPIHono();
app.doc('/doc', {
  openapi: '3.0.3',
  info: { title: 'Picker API', version: '1.0.0' },
});
registerRoutes(app as unknown as Hono);
registerOpenApiRoutes(app);

if (import.meta.main) {
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

export { app };
