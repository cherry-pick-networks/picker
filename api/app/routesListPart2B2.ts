//  Route list part 2b2: assessment, governance.

export const ROUTES_PART2B2: {
  method: string;
  path: string;
}[] = [
  {
    method: 'POST',
    path: '/content/assessment/wrong-answer-generate',
  },
  {
    method: 'POST',
    path: '/content/assessment/adaptive-next-item',
  },
  {
    method: 'POST',
    path: '/content/engines/assessment/generate',
  },
  { method: 'GET', path: '/report/anomaly/plagiarism' },
  {
    method: 'GET',
    path: '/report/assessment/partial-score',
  },
  {
    method: 'GET',
    path: '/report/assessment/formative-summative-gap',
  },
  {
    method: 'GET',
    path: '/governance/ontology/missing-link-predictor',
  },
  { method: 'GET', path: '/report/ontology/concept-drift' },
  {
    method: 'GET',
    path: '/governance/ontology/versioning',
  },
  {
    method: 'GET',
    path: '/content/items/auto-tag-confidence',
  },
  {
    method: 'GET',
    path:
      '/governance/assessment/mastery-threshold-validation',
  },
];
