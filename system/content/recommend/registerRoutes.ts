//
// Content recommend subdomain route registration.
// Used by system/content/registerContentRoutes.ts.
//

import type { Hono } from 'hono';
import * as recommendations from '#system/content/recommend/recommendationsEndpoint.ts';
import * as rag from '#system/content/recommend/ragEndpoint.ts';
import * as recommend from '#system/content/recommend/semanticEndpoint.ts';
import * as semanticItems from '#system/content/recommend/semanticItemEndpoint.ts';

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
