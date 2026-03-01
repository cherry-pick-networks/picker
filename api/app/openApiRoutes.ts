//
// Aggregates all OpenAPI route registrations.
// Called from main.ts after registerRoutes().
//

import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  registerAssessmentEngineOpenApi,
} from '#api/logic_app/assessmentEngineOpenApi.ts';
import {
  registerAssessmentEvaluationOpenApi,
} from '#api/logic_app/assessmentEvaluationOpenApi.ts';
import {
  registerDiagnoseOpenApi,
} from '#api/logic_app/diagnoseOpenApi.ts';
import {
  registerItemsAutoTagConfidenceOpenApi,
} from '#api/logic_app/bankAutoTagConfidenceOpenApi.ts';
import {
  registerGovernanceAssessmentOpenApi,
} from '#api/config/governanceAssessmentOpenApi.ts';
import {
  registerGovernanceOntologyOpenApi,
} from '#api/config/governanceOntologyOpenApi.ts';
import {
  registerIdentityAnalysisOpenApi,
} from '#identity/analysis/identityOpenApi.ts';
import {
  registerReportAssessmentExtendedOpenApi,
} from '#reporting/config/assessment/reportExtendedOpenApi.ts';
import {
  registerReportOntologyConceptDriftOpenApi,
} from '#reporting/config/ontology/reportConceptDriftOpenApi.ts';
import {
  registerReportPlagiarismOpenApi,
} from '#reporting/config/plagiarism/reportOpenApi.ts';
import {
  registerReportQueryOpenApi,
} from '#reporting/config/query/reportOpenApi.ts';
import {
  registerReportTeamsOpenApi,
} from '#reporting/config/teams/reportOpenApi.ts';

function registerContentAndReportPart1(
  app: OpenAPIHono,
): void {
  registerDiagnoseOpenApi(app);
  registerIdentityAnalysisOpenApi(app);
  registerReportQueryOpenApi(app);
}

function registerContentAndReportPart2(
  app: OpenAPIHono,
): void {
  registerReportTeamsOpenApi(app);
  registerAssessmentEngineOpenApi(app);
  registerAssessmentEvaluationOpenApi(app);
}

function registerContentAndReportPart3(
  app: OpenAPIHono,
): void {
  registerItemsAutoTagConfidenceOpenApi(app);
  registerReportPlagiarismOpenApi(app);
  registerReportAssessmentExtendedOpenApi(app);
  registerReportOntologyConceptDriftOpenApi(app);
}

function registerContentAndReportRoutes(
  app: OpenAPIHono,
): void {
  registerContentAndReportPart1(app);
  registerContentAndReportPart2(app);
  registerContentAndReportPart3(app);
}

export function registerOpenApiRoutes(
  app: OpenAPIHono,
): void {
  registerContentAndReportRoutes(app);
  registerGovernanceOntologyOpenApi(app);
  registerGovernanceAssessmentOpenApi(app);
}
