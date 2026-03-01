//
// Content recommend subdomain route registration.
// Used by application/content/registerContentRoutes.ts.
//

import type { Hono } from 'hono';
import * as recommendations from '#api/search/applications/recommendationsEndpoint.ts';
import * as rag from '#api/search/applications/ragEndpoint.ts';
import * as recommend from '#api/search/applications/semanticEndpoint.ts';
import * as semanticItems from '#api/search/applications/semanticItemEndpoint.ts';

export default function registerRoutes(app: Hono): void {
  app.get(
    '/content/recommendations',
    recommendations.getContentRecommendations,
  );
  app.post(
    '/content/recommend/semantic',
    recommend.postContentRecommendSemantic,
  );
  app.post(
    '/content/recommend/semantic-items',
    semanticItems.postContentRecommendSemanticItems,
  );
  app.post(
    '/content/recommend/rag',
    rag.postContentRecommendRag,
  );
}
