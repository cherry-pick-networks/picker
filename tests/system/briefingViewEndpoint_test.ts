//
// GET /views/team-briefing/:class_id: 404 when class_id missing, 200 + schema.
// Uses TEST_SKIP_ENTRA_AUTH so requests are not 401.
//

import { assertEquals } from '@std/assert';
import { app } from '../../main.ts';
import { TeamBriefingViewResponseSchema } from '#system/report/teams/briefingViewSchema.ts';

const handler = (req: Request) => app.fetch(req);

Deno.test(
  'GET /views/team-briefing/:class_id returns 404 when class_id is blank',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/views/team-briefing/%20',
        ),
      );
      assertEquals(res.status, 404);
      const body = await res.json();
      assertEquals(body.error, 'Not found');
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);

Deno.test(
  'GET /views/team-briefing/:class_id returns 200 and view schema for valid class_id',
  async () => {
    Deno.env.set('TEST_SKIP_ENTRA_AUTH', '1');
    try {
      const res = await handler(
        new Request(
          'http://localhost/views/team-briefing/some-class-id',
        ),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      const parsed = TeamBriefingViewResponseSchema
        .safeParse(
          body,
        );
      assertEquals(
        parsed.success,
        true,
        parsed.success
          ? ''
          : JSON.stringify(parsed.error.flatten()),
      );
      if (parsed.success) {
        assertEquals(
          typeof parsed.data.daily_briefing.briefing,
          'object',
        );
        assertEquals(
          Array.isArray(
            parsed.data.real_time_intervention.log,
          ),
          true,
        );
        assertEquals(
          Array.isArray(parsed.data.study_group.groups),
          true,
        );
        assertEquals(
          Array.isArray(parsed.data.fatigue.signals),
          true,
        );
        assertEquals(
          Array.isArray(parsed.data.fusion.signals),
          true,
        );
        assertEquals(
          Array.isArray(
            parsed.data.progress_conflict.conflicts,
          ),
          true,
        );
        assertEquals(
          Array.isArray(
            parsed.data.isolated_students.actors,
          ),
          true,
        );
        assertEquals(
          Array.isArray(
            parsed.data.resource_shortage.shortages,
          ),
          true,
        );
      }
    } finally {
      Deno.env.delete('TEST_SKIP_ENTRA_AUTH');
    }
  },
);
