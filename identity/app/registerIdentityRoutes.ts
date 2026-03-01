//
// Identity domain route registration.
// Used by application/app/routesRegisterConfig.ts.
//

import type { Hono } from 'hono';
import * as identity from '#identity/app/actors/endpoint.ts';
import * as schedule from '#identity/app/schedule/endpoint.ts';
import * as achievement from '#identity/app/achievement/endpoint.ts';
import * as curriculumMapping from '#identity/app/curriculum/mappingEndpoint.ts';
import { registerIdentityOutlook } from '#identity/app/registerIdentityRoutesOutlook.ts';

function registerIdentityActors(app: Hono): void {
  app.get('/identity/actors', identity.getActorsList);
  app.get('/identity/actors/:id', identity.getActorById);
  app.post('/identity/actors', identity.postActor);
  app.patch(
    '/identity/actors/:id',
    identity.patchActorById,
  );
}

function registerIdentitySchedulePart1(app: Hono): void {
  app.get('/identity/schedule/due', schedule.getDue);
  app.get(
    '/identity/schedule/plan/weekly',
    schedule.getWeekly,
  );
  app.get(
    '/identity/schedule/plan/annual',
    schedule.getAnnual,
  );
  app.get('/identity/schedule/items', schedule.getItems);
}

function registerIdentitySchedulePart2(app: Hono): void {
  app.post('/identity/schedule/items', schedule.postItem);
  app.get(
    '/identity/schedule/review-warnings',
    schedule.getReviewWarnings,
  );
  app.post(
    '/identity/schedule/items/:id/review',
    schedule.postReview,
  );
}

function registerIdentitySchedule(app: Hono): void {
  registerIdentitySchedulePart1(app);
  registerIdentitySchedulePart2(app);
}

function registerIdentityAchievement(app: Hono): void {
  app.post(
    '/identity/achievement/concept-outcome',
    achievement.postConceptOutcome,
  );
  app.get(
    '/identity/achievement/concept-outcomes',
    achievement.getConceptOutcomes,
  );
  app.post(
    '/identity/achievement/item-response',
    achievement.postItemResponse,
  );
  app.get(
    '/identity/achievement/item-responses',
    achievement.getItemResponses,
  );
}

function registerIdentityCurriculum(app: Hono): void {
  const path = '/identity/curriculum/external-mapping';
  app.post(path, curriculumMapping.postExternalMapping);
}

function registerIdentityScheduleAndCurriculum(
  app: Hono,
): void {
  registerIdentitySchedule(app);
  registerIdentityCurriculum(app);
}

function registerIdentityRoutes(app: Hono): void {
  registerIdentityActors(app);
  registerIdentityScheduleAndCurriculum(app);
  registerIdentityAchievement(app);
  registerIdentityOutlook(app);
}

export default registerIdentityRoutes;
