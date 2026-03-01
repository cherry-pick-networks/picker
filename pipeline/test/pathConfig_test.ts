//
// Tests for pathConfig (path-config.json paths). Run from repo root.
//
import { assertEquals } from '@std/assert';
import {
  getPath,
  getPaths,
  getRoot,
} from '#pipeline/config/pathConfig.ts';

Deno.test('getPath returns expected values from path-config.json paths', () => {
  assertEquals(getPath('config'), 'config');
  assertEquals(getPath('store'), 'docs/RULESET.md');
  assertEquals(getPath('todo'), 'docs/BACKLOG.md');
  assertEquals(getPath('contextScripts'), 'pipeline');
  assertEquals(getPath('context'), 'docs');
  assertEquals(getPath('infraSchema'), 'api/postgresql/template_spec');
  assertEquals(getPath('runtimeStore'), 'api/config/runtime/store');
});

Deno.test('getRoot returns absolute path to project root', () => {
  const root = getRoot();
  assertEquals(typeof root, 'string');
  const stat = Deno.statSync(root);
  assertEquals(stat.isDirectory, true);
});

Deno.test('getPaths returns object with all keys', () => {
  const p = getPaths();
  assertEquals(p.config, 'config');
  assertEquals(p.store, 'docs/RULESET.md');
  assertEquals(p.contextScripts, 'pipeline');
  assertEquals(typeof p.root, 'string');
});
