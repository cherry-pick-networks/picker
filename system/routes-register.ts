/**
 * Route registration: all app.get/post/patch/delete bindings.
 * Used by system/routes.ts registerRoutes().
 */

import type { Hono } from "hono";
import * as home from "./router/home.ts";
import * as kv from "./router/kv.ts";
import * as ast from "./router/ast.ts";
import * as astApply from "./router/ast-apply.ts";
import * as astDemo from "./router/ast-demo.ts";
import * as scripts from "./router/scripts.ts";
import * as profile from "./router/profile.ts";
import * as content from "./router/content.ts";
import * as source from "./router/source.ts";
import * as data from "./router/data.ts";

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

function registerContent(app: Hono) {
  registerContentItems(app);
  registerContentWorksheets(app);
}

function registerContentItems(app: Hono) {
  app.get("/content/items/:id", content.getItem);
  app.post("/content/items", content.postItem);
  app.patch("/content/items/:id", content.patchItem);
}

function registerContentWorksheets(app: Hono) {
  app.get("/content/worksheets/:id", content.getWorksheet);
  app.post("/content/worksheets/generate", content.postWorksheetsGenerate);
  app.post(
    "/content/worksheets/build-prompt",
    content.postWorksheetsBuildPrompt,
  );
}

function registerSource(app: Hono) {
  app.get("/sources", source.getSources);
  app.get("/sources/:id", source.getSource);
  app.post("/sources", source.postSource);
}

function registerData(app: Hono) {
  app.get("/data/extracted-index", data.getExtractedIndex);
  app.get("/data/identity-index", data.getIdentityIndex);
  app.get("/data/extracted/:id", data.getExtractedById);
  app.get("/data/identity/:id", data.getIdentityById);
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

const REST_HANDLERS = [
  registerHomeAndKv,
  registerProfile,
  registerProgress,
  registerContent,
  registerSource,
  registerData,
  registerKvMutate,
];

// deno-lint-ignore function-length/function-length
export function registerRestHandlers(app: Hono): void {
  for (const fn of REST_HANDLERS) fn(app);
}

export function registerAstAndScripts(app: Hono): void {
  registerAst(app);
  registerScripts(app);
}
