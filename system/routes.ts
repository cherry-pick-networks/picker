/**
 * Single source of route list for scope-check and main.ts registration.
 * Must match shared/prompt/boundary.md API surface table.
 */

import { serveStatic } from "hono/deno";
import type { Hono } from "hono";
import * as home from "./router/home.ts";
import * as kv from "./router/kv.ts";
import * as ast from "./router/ast.ts";
import * as astApply from "./router/ast-apply.ts";
import * as astDemo from "./router/ast-demo.ts";
import * as scripts from "./router/scripts.ts";
import * as profile from "./router/profile.ts";

export const ROUTES: { method: string; path: string }[] = [
  { method: "GET", path: "/" },
  { method: "GET", path: "/static/*" },
  { method: "GET", path: "/kv" },
  { method: "POST", path: "/kv" },
  { method: "GET", path: "/kv/:key" },
  { method: "DELETE", path: "/kv/:key" },
  { method: "GET", path: "/profile/:id" },
  { method: "POST", path: "/profile" },
  { method: "PATCH", path: "/profile/:id" },
  { method: "GET", path: "/progress/:id" },
  { method: "PATCH", path: "/progress/:id" },
  { method: "GET", path: "/ast" },
  { method: "GET", path: "/ast-demo" },
  { method: "POST", path: "/ast/apply" },
  { method: "GET", path: "/scripts" },
  { method: "GET", path: "/scripts/:path*" },
  { method: "POST", path: "/scripts/:path*" },
];

function registerRest(app: Hono) {
  registerHomeAndKv(app);
  registerProfile(app);
  registerProgress(app);
  registerKvMutate(app);
}

export function registerRoutes(app: Hono) {
  registerStatic(app);
  registerRest(app);
  registerAstAndScripts(app);
}

function registerStatic(app: Hono) {
  const root = "./system";
  app.use("/static/*", serveStatic({ root }));
}

function registerAstAndScripts(app: Hono) {
  registerAst(app);
  registerScripts(app);
}

function registerHomeAndKv(app: Hono) {
  app.get("/", home.getHome);
  app.get("/kv", kv.getKvList);
  app.get("/kv/:key", kv.getKvKey);
}

function registerProfile(app: Hono) {
  app.get("/profile/:id", profile.getProfile);
  app.post("/profile", profile.postProfile);
  app.patch("/profile/:id", profile.patchProfile);
}

function registerProgress(app: Hono) {
  app.get("/progress/:id", profile.getProgress);
  app.patch("/progress/:id", profile.patchProgress);
}

function registerKvMutate(app: Hono) {
  app.post("/kv", kv.postKv);
  app.delete("/kv/:key", kv.deleteKvKey);
}

function registerAst(app: Hono) {
  app.get("/ast", ast.getAst);
  app.get("/ast-demo", astDemo.getAstDemo);
  app.post("/ast/apply", astApply.postAstApply);
}

function registerScripts(app: Hono) {
  app.get("/scripts", scripts.getScriptsList);
  app.get("/scripts/*", scripts.getScriptPath);
  app.post("/scripts/*", scripts.postScriptPath);
}
