/**
 * Route registration: all app.get/post/patch/delete bindings.
 * Used by system/routes.ts registerRoutes().
 */

import type { Hono } from "hono";
import * as concept from "#system/concept/concept.endpoint.ts";
import * as content from "#system/content/content.endpoint.ts";
import * as data from "#system/record/data.endpoint.ts";
import * as home from "./home.config.ts";
import * as kv from "#system/kv/kv.endpoint.ts";
import * as profile from "#system/actor/profile.endpoint.ts";
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
  registerContentSubmissions(app);
}

function registerContentSubmissions(app: Hono) {
  app.post("/content/submissions", content.postSubmission);
  app.get("/content/submissions/:id", content.getSubmission);
  app.get("/content/submissions", content.getSubmissions);
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
  app.post("/content/briefing/build-prompt", content.postBriefingBuildPrompt);
}

function registerConcept(app: Hono) {
  app.get("/concepts/schemes", concept.getSchemes);
  app.get("/concepts/schemes/:schemeId/concepts", concept.getSchemeConcepts);
  app.get("/concepts/schemes/:id/tree", concept.getSchemeTree);
  app.get("/concepts/schemes/:schemeId", concept.getScheme);
  app.get("/concepts/:id/dependencies", concept.getConceptDependencies);
  app.get("/concepts/:id", concept.getConcept);
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
  registerConcept,
  registerSource,
  registerData,
  registerKvMutate,
];

export function registerRestHandlers(app: Hono): void {
  const fns = REST_HANDLERS;
  for (const fn of fns) fn(app);
}

export { registerAstAndScripts } from "./routes-register-ast.config.ts";
