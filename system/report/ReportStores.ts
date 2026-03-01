//
// Report-domain store aggregate. Single entry for tests and wiring.
//

import * as reviewEffortStore from './analytics/reviewEffortStore.ts';
import * as questionBankCoverageStore from './analytics/questionBankCoverageStore.ts';
import * as cohortWeaknessHeatmapStore from './analytics/cohortWeaknessHeatmapStore.ts';
import * as masteryTrajectoryStore from './analytics/masteryTrajectoryStore.ts';
import * as nodeDensityStore from './analytics/nodeDensityStore.ts';
import * as studyTimeRoiStore from './analytics/studyTimeRoiStore.ts';
import * as itemDiscriminationStore from './analytics/itemDiscriminationStore.ts';
import * as pacingDeviationStore from './analytics/pacingDeviationStore.ts';
import * as bottleneckStore from './analytics/bottleneckStore.ts';

export const ReportStores = {
  reviewEffortStore,
  questionBankCoverageStore,
  cohortWeaknessHeatmapStore,
  masteryTrajectoryStore,
  nodeDensityStore,
  studyTimeRoiStore,
  itemDiscriminationStore,
  pacingDeviationStore,
  bottleneckStore,
};
