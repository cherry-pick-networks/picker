//  Identity outlook route registration. Used by registerIdentityRoutes.ts.

import type { Hono } from 'hono';
import * as outlookPos from '#identity/app/outlook/positiveReinforcementEndpoint.ts';
import * as outlookHw from '#identity/app/outlook/missingHomeworkImpactEndpoint.ts';
import * as outlookMilestone from '#identity/app/outlook/milestoneAchievementEndpoint.ts';
import * as outlookFaq from '#identity/app/outlook/parentFaqContextEndpoint.ts';
import * as outlookMotivation from '#identity/app/outlook/motivationDropAlertEndpoint.ts';
import * as outlookWeekly from '#identity/app/outlook/weeklyWinEndpoint.ts';
import * as outlookIntervention from '#identity/app/outlook/interventionResultEndpoint.ts';
import * as outlookPreview from '#identity/app/outlook/nextMonthPreviewEndpoint.ts';
import * as outlookPosition from '#identity/app/outlook/relativePositionEndpoint.ts';
import * as outlookGoal from '#identity/app/outlook/customGoalTrackingEndpoint.ts';

function registerIdentityOutlookPart1(app: Hono): void {
  app.get(
    '/identity/outlook/positive-reinforcement',
    outlookPos.getPositiveReinforcement,
  );
  app.get(
    '/identity/outlook/missing-homework-impact',
    outlookHw.getMissingHomeworkImpact,
  );
  app.get(
    '/identity/outlook/milestone-achievement',
    outlookMilestone.getMilestoneAchievement,
  );
}

function registerIdentityOutlookPart2(app: Hono): void {
  app.get(
    '/identity/outlook/parent-faq-context',
    outlookFaq.getParentFaqContext,
  );
  app.get(
    '/identity/outlook/motivation-drop-alert',
    outlookMotivation.getMotivationDropAlert,
  );
  app.get(
    '/identity/outlook/weekly-win',
    outlookWeekly.getWeeklyWin,
  );
}

function registerIdentityOutlookPart3(app: Hono): void {
  app.get(
    '/identity/outlook/intervention-result',
    outlookIntervention.getInterventionResult,
  );
  app.get(
    '/identity/outlook/next-month-preview',
    outlookPreview.getNextMonthPreview,
  );
  app.get(
    '/identity/outlook/relative-position',
    outlookPosition.getRelativePosition,
  );
  app.get(
    '/identity/outlook/custom-goal-tracking',
    outlookGoal.getCustomGoalTracking,
  );
}

export function registerIdentityOutlook(app: Hono): void {
  registerIdentityOutlookPart1(app);
  registerIdentityOutlookPart2(app);
  registerIdentityOutlookPart3(app);
}
