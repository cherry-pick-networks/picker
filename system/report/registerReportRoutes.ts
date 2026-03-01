//
// Report domain route registration.
// Used by system/app/routesRegisterConfig.ts.
//

import type { Hono } from 'hono';
import * as report from '#system/report/analytics/bottleneckEndpoint.ts';
import * as anomaly from '#system/report/analytics/anomalyEndpoint.ts';
import * as cohortHeatmap from '#system/report/analytics/cohortWeaknessHeatmapEndpoint.ts';
import * as pacingDev from '#system/report/analytics/pacingDeviationEndpoint.ts';
import * as itemDisc from '#system/report/analytics/testItemDiscriminationEndpoint.ts';
import * as masteryTraj from '#system/report/analytics/masteryTrajectoryEndpoint.ts';
import * as studyRoi from '#system/report/analytics/studyTimeRoiEndpoint.ts';
import * as nodeDensity from '#system/report/analytics/nodeDensityScoreEndpoint.ts';
import * as peerBench from '#system/report/analytics/peerBenchmarkingEndpoint.ts';
import * as qBankCov from '#system/report/analytics/questionBankCoverageEndpoint.ts';
import * as reviewEffort from '#system/report/analytics/reviewEffortCorrelationEndpoint.ts';
import * as curriculumBottleneck from '#system/report/analytics/curriculumBottleneckEndpoint.ts';

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
