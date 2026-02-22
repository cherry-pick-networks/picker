/**
 * Route registration: all app.get/post/patch/delete bindings.
 * Used by system/routes.ts registerRoutes().
 */

import type { Hono } from "hono";
import * as content from "../content/content.endpoint.ts";
import * as data from "../record/data.endpoint.ts";
import * as home from "./home.config.ts";
import * as kv from "../kv/kv.endpoint.ts";
import * as profile from "../actor/profile.endpoint.ts";
import * as source from "../source/source.endpoint.ts";

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

function registerWorksheetsGetPost(app: Hono) {
  app.get("/content/worksheets/:id", content.getWorksheet);
  app.post("/content/worksheets/generate", content.postWorksheetsGenerate);
}

function registerContentWorksheets(app: Hono) {
  registerWorksheetsGetPost(app);
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

const REST_HANDLERS = [
  registerHomeAndKv,
  registerProfile,
  registerProgress,
  registerContent,
  registerSource,
  registerData,
  registerKvMutate,
];

export function registerRestHandlers(app: Hono): void {
  const fns = REST_HANDLERS;
  for (const fn of fns) fn(app);
}

export { registerAstAndScripts } from "./routes-register-ast.config.ts";
