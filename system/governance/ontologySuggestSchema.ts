//  Missing-link predictor (56) and ontology versioning (58).

import { z } from '@hono/zod-openapi';

export const MissingLinkPredictorQuerySchema = z.object({
  scheme_id: z.string().optional(),
});
export type MissingLinkPredictorQuery = z.infer<
  typeof MissingLinkPredictorQuerySchema
>;

export const OntologyVersioningQuerySchema = z.object({
  scheme_id: z.string().optional(),
});
export type OntologyVersioningQuery = z.infer<
  typeof OntologyVersioningQuerySchema
>;

export const MissingLinkPredictorResponseSchema = z
  .object({
    suggestions: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('MissingLinkPredictorResponse');

export const OntologyVersioningResponseSchema = z
  .object({
    versions: z.array(z.record(z.string(), z.unknown())),
  })
  .openapi('OntologyVersioningResponse');
