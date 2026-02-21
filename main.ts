import { App, staticFiles } from "fresh";
import { handler as indexHandler } from "./system/router/index.ts";
import { handler as kvKeyHandler } from "./system/router/kv/[key].ts";
import { handler as kvIndexHandler } from "./system/router/kv/index.ts";
import { handler as astHandler } from "./system/router/ast.ts";
import { handler as astDemoHandler } from "./system/router/ast-demo.ts";
import { handler as scriptsIndexHandler } from "./system/router/scripts/index.ts";
import { handler as scriptsPathHandler } from "./system/router/scripts/[...path].ts";

export const app = new App()
  .use(staticFiles())
  .get("/", (_ctx) => indexHandler.GET())
  .get("/kv", (ctx) => kvIndexHandler.GET(ctx.req))
  .get("/kv/:key", (ctx) => kvKeyHandler.GET(ctx.req, ctx))
  .delete("/kv/:key", (ctx) => kvKeyHandler.DELETE(ctx.req, ctx))
  .post("/kv", (ctx) => kvIndexHandler.POST(ctx.req))
  .get("/ast", (_ctx) => astHandler.GET())
  .get("/ast-demo", (_ctx) => astDemoHandler.GET())
  .get("/scripts", () => scriptsIndexHandler.GET())
  .get("/scripts/:path*", (ctx) =>
    scriptsPathHandler.GET(ctx.req, ctx as { params: Record<string, string> })
  )
  .fsRoutes();

if (import.meta.main) {
  await app.listen({ port: 8000 });
}
