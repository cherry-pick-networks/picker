//
// Report domain route registration.
// Used by application/app/routesRegisterConfig.ts.
//

import type { Hono } from 'hono';
import * as report from '#analytics/datafactory/bottleneckEndpoint.ts';
import * as anomaly from '#analytics/applicationinsights/anomalyEndpoint.ts';
import * as cohortHeatmap from '#analytics/config/cohortWeaknessHeatmapEndpoint.ts';
import * as pacingDev from '#analytics/apimanagement/pacingDeviationEndpoint.ts';
import * as itemDisc from '#analytics/search/testItemDiscriminationEndpoint.ts';
import * as masteryTraj from '#analytics/eventhub/masteryTrajectoryEndpoint.ts';
import * as studyRoi from '#analytics/templatespec/studyTimeRoiEndpoint.ts';
import * as nodeDensity from '#analytics/log/nodeDensityScoreEndpoint.ts';
import * as peerBench from '#analytics/automationaccount/peerBenchmarkingEndpoint.ts';
import * as qBankCov from '#analytics/function/questionBankCoverageEndpoint.ts';
import * as reviewEffort from '#analytics/logicapp/reviewEffortCorrelationEndpoint.ts';
import * as curriculumBottleneck from '#analytics/datafactory/curriculumBottleneckEndpoint.ts';

function registerReportRoutesPart1(app: Hono): void {
  app.get('/report/bottlenecks', report.getBottlenecks);
  app.post('/report/anomaly', anomaly.postAnomaly);
  app.get(
    '/report/cohort-weakness-heatmap',
    cohortHeatmap.getCohortWeaknessHeatmap,
  );
  app.get(
    '/report/pacing-deviation',
    pacingDev.getPacingDeviation,
  );
}

function registerReportRoutesPart2(app: Hono): void {
  app.get(
    '/report/test-item-discrimination',
    itemDisc.getTestItemDiscrimination,
  );
  app.get(
    '/report/mastery-trajectory',
    masteryTraj.getMasteryTrajectory,
  );
  app.get(
    '/report/study-time-roi',
    studyRoi.getStudyTimeRoi,
  );
  app.get(
    '/report/node-density-score',
    nodeDensity.getNodeDensityScore,
  );
}

function registerReportRoutesPart3(app: Hono): void {
  app.get(
    '/report/peer-benchmarking',
    peerBench.getPeerBenchmarking,
  );
  app.get(
    '/report/question-bank-coverage',
    qBankCov.getQuestionBankCoverage,
  );
  app.get(
    '/report/review-effort-correlation',
    reviewEffort.getReviewEffortCorrelation,
  );
  app.get(
    '/report/curriculum-bottleneck',
    curriculumBottleneck.getCurriculumBottleneck,
  );
}

function registerReportRoutes(app: Hono): void {
  registerReportRoutesPart1(app);
  registerReportRoutesPart2(app);
  registerReportRoutesPart3(app);
}

export default registerReportRoutes;
