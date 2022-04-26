import test from 'ava';
import mockery from 'mockery';

import pify from 'pify';

import mocks from './helpers/mocks';

test.before(() => {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true,
  });
});

test.beforeEach(() => {
  mockery.resetCache();
});

test.after(() => {
  mockery.disable();
});

test('should parse ps output on Darwin', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'darwin',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});

test('should parse ps output on *nix', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});

test('should throw if stderr contains an error', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, 'Some error', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  await t.throws(pify(ps)())

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});

test('should not throw if stderr contains the "bogus" error message from vscode', async t => {
  const stdout =
    'PPID   PID\n' +
    '   1   430\n' +
    ' 430   432\n' +
    '   1   727\n' +
    '   1  7166\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, 'Error: your 131072x1 screen size is bogus. expect trouble', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  const result = await pify(ps)();
  t.deepEqual(result, [[1, 430], [430, 432], [1, 727], [1, 7166]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});
