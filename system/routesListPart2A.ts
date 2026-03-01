//  Route list part 2a: report, identity/outlook.

export const ROUTES_PART2A: {
  method: string;
  path: string;
}[] = [
  { method: 'GET', path: '/report/bottlenecks' },
  { method: 'POST', path: '/report/query' },
  { method: 'POST', path: '/report/anomaly' },
  {
    method: 'GET',
    path: '/report/cohort-weakness-heatmap',
  },
  { method: 'GET', path: '/report/pacing-deviation' },
  {
    method: 'GET',
    path: '/report/test-item-discrimination',
  },
  { method: 'GET', path: '/report/mastery-trajectory' },
  { method: 'GET', path: '/report/study-time-roi' },
  { method: 'GET', path: '/report/node-density-score' },
  { method: 'GET', path: '/report/peer-benchmarking' },
  { method: 'GET', path: '/report/question-bank-coverage' },
  {
    method: 'GET',
    path: '/report/review-effort-correlation',
  },
  { method: 'GET', path: '/report/curriculum-bottleneck' },
  {
    method: 'GET',
    path: '/identity/outlook/positive-reinforcement',
  },
  {
    method: 'GET',
    path: '/identity/outlook/missing-homework-impact',
  },
  {
    method: 'GET',
    path: '/identity/outlook/milestone-achievement',
  },
  {
    method: 'GET',
    path: '/identity/outlook/parent-faq-context',
  },
  {
    method: 'GET',
    path: '/identity/outlook/motivation-drop-alert',
  },
  { method: 'GET', path: '/identity/outlook/weekly-win' },
  {
    method: 'GET',
    path: '/identity/outlook/intervention-result',
  },
  {
    method: 'GET',
    path: '/identity/outlook/next-month-preview',
  },
  {
    method: 'GET',
    path: '/identity/outlook/relative-position',
  },
  {
    method: 'GET',
    path: '/identity/outlook/custom-goal-tracking',
  },
];
