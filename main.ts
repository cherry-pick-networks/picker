import { App, staticFiles } from "fresh";
import { handler as indexHandler } from "./system/router/index.ts";
import { handler as kvKeyHandler } from "./system/router/kv/[key].ts";
import { handler as kvIndexHandler } from "./system/router/kv/index.ts";
import { handler as astHandler } from "./system/router/ast.ts";

export const app = new App()
  .use(staticFiles())
  .get("/", (_ctx) => indexHandler.GET())
  .get("/kv", (ctx) => kvIndexHandler.GET(ctx.req))
  .get("/kv/:key", (ctx) => kvKeyHandler.GET(ctx.req, ctx))
  .post("/kv", (ctx) => kvIndexHandler.POST(ctx.req))
  .get("/ast", (_ctx) => astHandler.GET())
  .fsRoutes();

if (import.meta.main) {
  await app.listen({ port: 8000 });
}
