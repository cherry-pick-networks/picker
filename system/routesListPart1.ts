//  Route list part 1: root, scripts, sources, views, core, kv, identity (partial).

export const ROUTES_PART1: {
  method: string;
  path: string;
}[] = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/identity/actors' },
  { method: 'GET', path: '/identity/actors/:id' },
  { method: 'POST', path: '/identity/actors' },
  { method: 'PATCH', path: '/identity/actors/:id' },
  { method: 'GET', path: '/scripts' },
  { method: 'GET', path: '/scripts/:path*' },
  { method: 'POST', path: '/scripts/:path*' },
  { method: 'POST', path: '/script/mutate' },
  { method: 'GET', path: '/sources' },
  { method: 'GET', path: '/sources/:id' },
  { method: 'POST', path: '/sources' },
  { method: 'POST', path: '/sources/:id/extract' },
  { method: 'GET', path: '/views/source-dashboard/:id' },
  { method: 'GET', path: '/views/actor-briefing/:id' },
  { method: 'GET', path: '/views/team-briefing/:class_id' },
  { method: 'GET', path: '/core/items/:id' },
  { method: 'POST', path: '/core/items' },
  { method: 'PATCH', path: '/core/items/:id' },
  {
    method: 'POST',
    path: '/content/items/generate-dynamic',
  },
  {
    method: 'GET',
    path: '/content/assessment/prompt-context',
  },
  { method: 'GET', path: '/lexis/entries' },
  { method: 'GET', path: '/identity/schedule/due' },
  { method: 'GET', path: '/identity/schedule/plan/weekly' },
  { method: 'GET', path: '/identity/schedule/plan/annual' },
  {
    method: 'POST',
    path: '/identity/curriculum/external-mapping',
  },
  { method: 'GET', path: '/identity/schedule/items' },
  { method: 'POST', path: '/identity/schedule/items' },
  {
    method: 'POST',
    path: '/identity/schedule/items/:id/review',
  },
  {
    method: 'GET',
    path: '/identity/schedule/review-warnings',
  },
  { method: 'GET', path: '/kv' },
  { method: 'POST', path: '/kv' },
  { method: 'GET', path: '/kv/:key' },
  { method: 'DELETE', path: '/kv/:key' },
  { method: 'GET', path: '/content/recommendations' },
  { method: 'POST', path: '/content/recommend/semantic' },
  {
    method: 'POST',
    path: '/content/recommend/semantic-items',
  },
  { method: 'POST', path: '/content/recommend/rag' },
  {
    method: 'POST',
    path: '/content/diagnose/misconception',
  },
  {
    method: 'POST',
    path: '/content/review/map-to-ontology',
  },
  {
    method: 'POST',
    path: '/identity/achievement/concept-outcome',
  },
  {
    method: 'GET',
    path: '/identity/achievement/concept-outcomes',
  },
  {
    method: 'POST',
    path: '/identity/achievement/item-response',
  },
  {
    method: 'GET',
    path: '/identity/achievement/item-responses',
  },
  { method: 'POST', path: '/identity/analysis/root-cause' },
  { method: 'POST', path: '/identity/actors/cluster' },
];
