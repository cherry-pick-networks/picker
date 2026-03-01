//
// Tests for pathConfig (config/path-config.json paths). Run from repo root.
//
import { assertEquals } from '@std/assert';
import {
  getPath,
  getPaths,
  getRoot,
} from '../../sharepoint/context/scripts/pathConfig.ts';

Deno.test('getPath returns expected values from config/path-config.json paths', () => {
  assertEquals(getPath('config'), 'config');
  assertEquals(
    getPath('store'),
    'sharepoint/context/RULESET.md',
  );
  assertEquals(
    getPath('todo'),
    'sharepoint/context/BACKLOG.md',
  );
  assertEquals(
    getPath('contextScripts'),
    'sharepoint/context/scripts',
  );
  assertEquals(getPath('context'), 'sharepoint/context');
  assertEquals(
    getPath('infraSchema'),
    'sharepoint/infra/schema',
  );
  assertEquals(
    getPath('runtimeStore'),
    'sharepoint/runtime/store',
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
  assertEquals(p.store, 'sharepoint/context/RULESET.md');
  assertEquals(p.contextScripts, 'sharepoint/context/scripts');
  assertEquals(typeof p.root, 'string');
});
