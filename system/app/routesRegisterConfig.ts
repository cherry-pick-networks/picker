/**
 * Route registration: all app.get/post/patch/delete bindings.
 * Used by system/routes.ts registerRoutes().
 */

import type { Hono } from "hono";
import * as content from "#system/content/contentEndpoint.ts";
import * as home from "./homeHandler.ts";
import * as identity from "#system/identity/actorsEndpoint.ts";
import * as kv from "#system/kv/kvEndpoint.ts";
import * as lexis from "#system/lexis/lexisEndpoint.ts";
import * as schedule from "#system/schedule/scheduleEndpoint.ts";
import * as source from "#system/source/sourceEndpoint.ts";

function registerHomeAndKv(app: Hono) {
  app.get("/", home.getHome);
  app.get("/kv", kv.getKvList);
  app.get("/kv/:key", kv.getKvKey);
}

function registerIdentity(app: Hono) {
  app.get("/identity/actors", identity.getActorsList);
  app.get("/identity/actors/:id", identity.getActorById);
  app.post("/identity/actors", identity.postActor);
  app.patch("/identity/actors/:id", identity.patchActorById);
}

function registerMirrorContent(app: Hono) {
  app.get("/mirror/content/items/:id", content.getItem);
  app.post("/mirror/content/items", content.postItem);
  app.patch("/mirror/content/items/:id", content.patchItem);
  app.get("/mirror/content/worksheets/:id", content.getWorksheet);
  app.post("/mirror/content/worksheets", content.postWorksheets);
}

function registerMirrorLexis(app: Hono) {
  app.get("/mirror/lexis/entries", lexis.getEntries);
}

function registerMirrorSchedule(app: Hono) {
  app.get("/mirror/schedule/due", schedule.getDue);
  app.get("/mirror/schedule/plan/weekly", schedule.getWeekly);
  app.get("/mirror/schedule/plan/annual", schedule.getAnnual);
  app.get("/mirror/schedule/items", schedule.getItems);
  app.post("/mirror/schedule/items", schedule.postItem);
  app.post("/mirror/schedule/items/:id/review", schedule.postReview);
}

function registerMirror(app: Hono) {
  registerMirrorContent(app);
  registerMirrorLexis(app);
  registerMirrorSchedule(app);
}

function registerSource(app: Hono) {
  app.get("/sources", source.getSources);
  app.get("/sources/:id", source.getSource);
  app.post("/sources", source.postSource);
  app.post("/sources/:id/extract", source.postSourceExtract);
}

function registerKvMutate(app: Hono) {
  app.post("/kv", kv.postKv);
  app.delete("/kv/:key", kv.deleteKvKey);
}

const REST_HANDLERS = [
  registerHomeAndKv,
  registerIdentity,
  registerMirror,
  registerSource,
  registerKvMutate,
];

export function registerRestHandlers(app: Hono): void {
  const fns = REST_HANDLERS;
  for (const fn of fns) fn(app);
}

export { registerAstAndScripts } from "./routesRegisterScriptsConfig.ts";
