//
// Tests for pathConfig (config/path-config.json paths). Run from repo root.
//
import { assertEquals } from '@std/assert';
import {
  getPath,
  getPaths,
  getRoot,
} from '../../shared/context/scripts/pathConfig.ts';

Deno.test('getPath returns expected values from config/path-config.json paths', () => {
  assertEquals(getPath('config'), 'config');
  assertEquals(
    getPath('store'),
    'shared/context/RULESET.md',
  );
  assertEquals(
    getPath('todo'),
    'shared/context/BACKLOG.md',
  );
  assertEquals(
    getPath('contextScripts'),
    'shared/context/scripts',
  );
  assertEquals(getPath('context'), 'shared/context');
  assertEquals(
    getPath('infraSchema'),
    'shared/infra/schema',
  );
  assertEquals(
    getPath('runtimeStore'),
    'shared/runtime/store',
  );
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
  assertEquals(p.store, 'shared/context/RULESET.md');
  assertEquals(p.contextScripts, 'shared/context/scripts');
  assertEquals(typeof p.root, 'string');
});
