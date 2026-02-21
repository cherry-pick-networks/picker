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

export function registerRoutes(app: Hono) {
  registerHomeAndKv(app);
  registerKvMutate(app);
  registerAst(app);
  registerScripts(app);
}

function registerHomeAndKv(app: Hono) {
  app.get("/", home.getHome);
  app.get("/kv", kv.getKvList);
  app.get("/kv/:key", kv.getKvKey);
}

function registerKvMutate(app: Hono) {
  app.post("/kv", kv.postKv);
  app.delete("/kv/:key", kv.deleteKvKey);
}

function registerAst(app: Hono) {
  app.get("/ast", ast.getAst);
  app.get("/ast-demo", astDemo.getAstDemo);
}

function registerScripts(app: Hono) {
  app.get("/scripts", scripts.getScriptsList);
  app.get("/scripts/*", scripts.getScriptPath);
  app.post("/scripts/*", scripts.postScriptPath);
}
