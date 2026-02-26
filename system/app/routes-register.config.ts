/**
 * Route registration: all app.get/post/patch/delete bindings.
 * Used by system/routes.ts registerRoutes().
 */

import type { Hono } from "hono";
import * as content from "#system/content/content.endpoint.ts";
import * as data from "#system/record/data.endpoint.ts";
import * as home from "./home.config.ts";
import * as kv from "#system/kv/kv.endpoint.ts";
import * as profile from "#system/actor/profile.endpoint.ts";
import * as schedule from "#system/schedule/schedule.endpoint.ts";
import * as source from "#system/source/source.endpoint.ts";

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
  app.post("/sources/:id/extract", source.postSourceExtract);
}

function registerData(app: Hono) {
  app.get("/data/identity-index", data.getIdentityIndex);
  app.get("/data/identity/:id", data.getIdentityById);
}

// function-length-ignore
function registerSchedule(app: Hono) {
  app.get("/schedule/due", schedule.getDue);
  app.get("/schedule/plan/weekly", schedule.getWeekly);
  app.get("/schedule/items", schedule.getItems);
  app.post("/schedule/items", schedule.postItem);
  app.post("/schedule/items/:id/review", schedule.postReview);
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
  registerSchedule,
  registerKvMutate,
];

export function registerRestHandlers(app: Hono): void {
  const fns = REST_HANDLERS;
  for (const fn of fns) fn(app);
}

export { registerAstAndScripts } from "./routes-register-ast.config.ts";
