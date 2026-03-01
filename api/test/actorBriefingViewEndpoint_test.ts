//
// GET /views/actor-briefing/:id: 404 when missing actor, 200 and schema when exists.
// Requires Postgres.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { ActorBriefingViewSchema } from '#identity/config/presentation_instances/actorViewSchema.ts';
import { hasDbEnv } from './dbEnv_test.ts';

const handler = (req: Request) => app.fetch(req);
const dbTestOpts = () => ({
  sanitizeResources: false,
  ignore: !hasDbEnv(),
});

Deno.test(
  'GET /views/actor-briefing/:id returns 404 for missing actor',
  dbTestOpts(),
  async () => {
    const res = await handler(
      new Request(
        'http://localhost/views/actor-briefing/nonexistent-actor-404',
      ),
    );
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.error, 'Not found');
  },
);

Deno.test(
  'GET /views/actor-briefing/:id returns 200 and view schema when actor exists',
  dbTestOpts(),
  async () => {
    const createRes = await handler(
      new Request('http://localhost/identity/actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name:
            `Actor Briefing View Test ${Date.now()}`,
        }),
      }),
    );
    assertEquals(createRes.status, 201);
    const created = await createRes.json();
    const actorId = created.actor_id as string;

    const res = await handler(
      new Request(
        `http://localhost/views/actor-briefing/${actorId}`,
      ),
    );
    assertEquals(res.status, 200);
    const body = await res.json();
    const parsed = ActorBriefingViewSchema.safeParse(body);
    assertEquals(
      parsed.success,
      true,
      parsed.success
        ? ''
        : JSON.stringify(parsed.error.flatten()),
    );
    assertEquals(
      body.positive_reinforcement.suggestions,
      [],
    );
    assertEquals(
      body.missing_homework_impact.impact_summary,
      null,
    );
    assertEquals(
      Array.isArray(body.milestone_achievement.milestones),
      true,
    );
    assertEquals(body.parent_faq_context.stub, true);
    assertEquals(
      Array.isArray(body.motivation_drop_alert.alerts),
      true,
    );
    assertEquals(Array.isArray(body.weekly_win.wins), true);
    assertEquals(
      Array.isArray(body.intervention_result.results),
      true,
    );
    assertEquals(
      typeof body.next_month_preview.preview,
      'object',
    );
    assertEquals(body.relative_position.position, null);
    assertEquals(
      Array.isArray(body.custom_goal_tracking.goals),
      true,
    );
    assertEquals(
      typeof body.custom_goal_tracking.progress,
      'object',
    );
  },
);
