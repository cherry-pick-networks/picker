//
// Route registration: all app.get/post/patch/delete bindings.
// Used by system/routes.ts registerRoutes().
//

import type { Hono } from 'hono';
import registerReportRoutes from '#system/report/registerReportRoutes.ts';
import registerIdentityRoutes from '#system/identity/registerIdentityRoutes.ts';
import registerContentRoutes from '#system/content/registerContentRoutes.ts';
import * as home from './homeHandler.ts';
import * as kv from '#system/infra/storageEndpoint.ts';
import * as lexis from '#system/content/material/lexisEndpoint.ts';
import * as source from '#system/content/material/sourceEndpoint.ts';
import * as sourceDashboardView from '#system/content/material/dashboardViewEndpoint.ts';
import * as actorBriefingView from '#system/identity/briefing/actorViewEndpoint.ts';
import * as teamBriefingView from '#system/report/teams/briefingViewEndpoint.ts';

function registerHomeAndKv(app: Hono) {
  app.get('/', home.getHome);
  app.get('/kv', kv.getKvList);
  app.get('/kv/:key', kv.getKvKey);
}

function registerIdentityReportAndCore(app: Hono) {
  registerIdentityRoutes(app);
  registerReportRoutes(app);
  registerContentRoutes(app);
}

function registerSourceRoutes(app: Hono) {
  app.get('/sources', source.getSources);
  app.get('/sources/:id', source.getSource);
  app.post('/sources', source.postSource);
  app.post(
    '/sources/:id/extract',
    source.postSourceExtract,
  );
}

function registerSource(app: Hono) {
  registerSourceRoutes(app);
  app.get('/lexis/entries', lexis.getEntries);
}

function registerViews(app: Hono) {
  app.get(
    '/views/source-dashboard/:id',
    sourceDashboardView.getSourceDashboard,
  );
  app.get(
    '/views/actor-briefing/:id',
    actorBriefingView.getActorBriefing,
  );
  app.get(
    '/views/team-briefing/:class_id',
    teamBriefingView.getTeamBriefing,
  );
}

function registerKvMutate(app: Hono) {
  app.post('/kv', kv.postKv);
  app.delete('/kv/:key', kv.deleteKvKey);
}

const REST_HANDLERS = [
  registerHomeAndKv,
  registerIdentityReportAndCore,
  registerSource,
  registerViews,
  registerKvMutate,
];

export function registerRestHandlers(app: Hono): void {
  const fns = REST_HANDLERS;
  for (const fn of fns) fn(app);
}

export { registerAstAndScripts } from './routesRegisterScriptsConfig.ts';
