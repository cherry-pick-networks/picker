import { Hono } from "hono";
import { registerRoutes } from "#system/routes.ts";

const app = new Hono();
registerRoutes(app);

if (import.meta.main) {
  Deno.serve({ port: 8000 }, (req) => app.fetch(req));
}

export { app };
