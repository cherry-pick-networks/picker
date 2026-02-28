import { setAllowlistLoader } from '#shared/contract/allowlistData.ts';
import { loadAllowlistData } from '#system/concept/conceptStore.ts';
import { Hono } from 'hono';
import { registerRoutes } from '#system/routes.ts';

setAllowlistLoader(loadAllowlistData);
const app = new Hono();
registerRoutes(app);

if (import.meta.main) {
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

export { app };
