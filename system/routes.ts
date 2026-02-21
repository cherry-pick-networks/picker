/**
 * Single source of route list for scope-check and main.ts registration.
 * Must match shared/prompt/boundary.md API surface table.
 */

import type { Hono } from "hono";
import * as home from "./router/home.ts";
import * as kv from "./router/kv.ts";
import * as ast from "./router/ast.ts";
import * as astDemo from "./router/ast-demo.ts";
import * as scripts from "./router/scripts.ts";

export const ROUTES: { method: string; path: string }[] = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/kv" },
  { method: "POST", path: "/kv" },
  { method: "GET", path: "/kv/:key" },
  { method: "DELETE", path: "/kv/:key" },
  { method: "GET", path: "/ast" },
  { method: "GET", path: "/ast-demo" },
  { method: "GET", path: "/scripts" },
  { method: "GET", path: "/scripts/:path*" },
  { method: "POST", path: "/scripts/:path*" },
];

// deno-lint-ignore function-length/function-length
export function registerRoutes(app: Hono) {
  app.get("/", home.getHome);
  app.get("/kv", kv.getKvList);
  app.post("/kv", kv.postKv);
  app.get("/kv/:key", kv.getKvKey);
  app.delete("/kv/:key", kv.deleteKvKey);
  app.get("/ast", ast.getAst);
  app.get("/ast-demo", astDemo.getAstDemo);
  app.get("/scripts", scripts.getScriptsList);
  app.get("/scripts/*", scripts.getScriptPath);
  app.post("/scripts/*", scripts.postScriptPath);
}
