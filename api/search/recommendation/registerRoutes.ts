//
// Content recommend subdomain route registration.
// Used by application/content/registerContentRoutes.ts.
//

import type { Hono } from 'hono';
import * as recommendations from '#api/search/recommend/recommendationsEndpoint.ts';
import * as rag from '#api/search/recommend/ragEndpoint.ts';
import * as recommend from '#api/search/recommend/semanticEndpoint.ts';
import * as semanticItems from '#api/search/recommend/semanticItemEndpoint.ts';

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
