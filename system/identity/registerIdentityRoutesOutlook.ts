//  Identity outlook route registration. Used by registerIdentityRoutes.ts.

import type { Hono } from 'hono';
import * as outlookPos from '#system/identity/outlook/positiveReinforcementEndpoint.ts';
import * as outlookHw from '#system/identity/outlook/missingHomeworkImpactEndpoint.ts';
import * as outlookMilestone from '#system/identity/outlook/milestoneAchievementEndpoint.ts';
import * as outlookFaq from '#system/identity/outlook/parentFaqContextEndpoint.ts';
import * as outlookMotivation from '#system/identity/outlook/motivationDropAlertEndpoint.ts';
import * as outlookWeekly from '#system/identity/outlook/weeklyWinEndpoint.ts';
import * as outlookIntervention from '#system/identity/outlook/interventionResultEndpoint.ts';
import * as outlookPreview from '#system/identity/outlook/nextMonthPreviewEndpoint.ts';
import * as outlookPosition from '#system/identity/outlook/relativePositionEndpoint.ts';
import * as outlookGoal from '#system/identity/outlook/customGoalTrackingEndpoint.ts';

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
