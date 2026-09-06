import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// An optional extracted package directory lets the same checks exercise a tarball.
const packageRoot = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const entry = resolve(packageRoot, metadata.main);
const esm = await import(pathToFileURL(entry).href);

const diff = esm.default;
assert.equal(typeof diff, 'function');
assert.equal(diff.updatedValues.both, 3);
assert.deepEqual(diff([], [{ id: 'constructor' }]).added, [{ id: 'constructor' }]);
assert.deepEqual(diff([{ id: 1, v: 'a' }], [{ id: 1, v: 'b' }], 'id', {
  updatedValues: diff.updatedValues.both,
}).updated, [[{ id: 1, v: 'a' }, { id: 1, v: 'b' }]]);
assert.equal(esm.UpdatedValues, esm.default.updatedValues);
console.log('ESM package smoke checks passed.');
