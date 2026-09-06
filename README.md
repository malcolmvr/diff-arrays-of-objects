# @wvanderp/diff-arrays-of-objects

> Compare two arrays of objects, finding added, removed, updated and identical objects. Details the differences between updated objects.

Requires Node.js 22.13 or newer. This fork retains the original MIT license and
author attribution.

## Install

```bash
$ npm install @wvanderp/diff-arrays-of-objects
```
## Usage

```js
import diff from '@wvanderp/diff-arrays-of-objects';
var result = diff(
  [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
    {id: 3, name: 'c'},
    {id: 4, name: 'd'},
    {id: 5, name: 'e'}
  ],
  [
    {id: 1, name: 'a'},
    {id: 2, name: 'z'},
    {id: 7, name: 'e'}
  ],
  'id'
);

console.log(result)
// {
//   added: [
//     { id: 7, name: 'e' }
//   ],
//   removed: [
//     { id: 3, name: 'c' },
//     { id: 4, name: 'd' },
//     { id: 5, name: 'e' }
//   ],
//   updated: [
//     { id: 2, name: 'z' }
//   ],
//   same: [
//     { id: 1, name: 'a' }
//   ]
// }
```

## API

### diff-arrays-of-objects (first, second, idField, [options])

#### first

*Required*<br>
Type: `array`

First array to be compared.

#### second

*Required*<br>
Type: `array`

Second array to be compared.

#### idField

*Optional; defaults to `'id'`*<br>
Type: `string`

The id field that is used to compare the arrays. Defaults to 'id'.

#### options

Type: `object`

```js
{
  compareFunction: <Func> // defaults to lodash's isEqual; must accept two parameters (o1, o2)
  updatedValues: <Number> // controls what gets returned in the "updated" results array:
                          // diff.updatedValues.first (1): the value from the first array
                          // diff.updatedValues.second (2): the value from the second array (default)
                          // diff.updatedValues.both (3): both values, as an array [first, second]
                          // diff.updatedValues.bothWithDeepDiff (4): both values, plus the results of the deep-diff module; [first, second, deep-diff]
}
```

Examples:

```js
import diff from '@wvanderp/diff-arrays-of-objects';
const first = [{ id: 1, letter: 'a' }];
const second = [{ id: 1, letter: 'b' }];

const firstResult = diff(first, second, 'id', { updatedValues: diff.updatedValues.first });
// firstResult.updated is [{ id: 1, letter: 'a' }]

const secondResult = diff(first, second, 'id', { updatedValues: diff.updatedValues.second });
// secondResult.updated is [{ id: 1, letter: 'b' }]

const bothResult = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
// bothResult.updated is [[{ id: 1, letter: 'a' }, { id: 1, letter: 'b' }]]

const deepResult = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
// deepResult.updated is [[
//   { id: 1, letter: 'a' },
//   { id: 1, letter: 'b' },
//   [{ kind: 'E', path: ['letter'], lhs: 'a', rhs: 'b' }]
// ]]
```

See [deep-diff](https://github.com/flitbit/diff) for more info on the change format.

### Identity and supported values

Use a unique string or number ID on every item. IDs are compared after string
conversion, so `1` and `'1'` identify the same record. Reserved strings such as
`'constructor'` and `'__proto__'` are valid IDs. Missing and duplicate IDs are not
validated; duplicate IDs in the first array use its last record for matching.

The default comparator is Lodash `isEqual`. Detailed changes support ordinary
objects with enumerable string keys, arrays, dates, regular expressions, and
primitive values. Changed Maps and Sets are reported as whole-value edits,
including when nested, so their native types survive applying or reverting a
change. Symbol-keyed properties and other specialized objects are outside the
documented detailed-change contract. Custom comparators can produce an updated
pair with an empty change list even when both values are structurally identical.

Regular-expression edits retain the original `RegExp` values in `lhs` and `rhs`
so applying and reverting changes preserves their type.

The bundled deep-diff patch helpers reject `__proto__`, `constructor`, and
`prototype` path segments with an error and do not traverse inherited objects.
Patches are applied incrementally, so an error can leave earlier changes applied.

## TypeScript

The item type is inferred from the input arrays. The type of `updated` is also
inferred from `updatedValues`:

```ts
import diff from '@wvanderp/diff-arrays-of-objects';

interface User {
  id: number;
  name: string;
}

const before: readonly User[] = [{ id: 1, name: 'Ada' }];
const after: readonly User[] = [{ id: 1, name: 'Grace' }];

const result = diff(before, after, 'id', {
  updatedValues: diff.updatedValues.both,
});

// Inferred as [User, User][]
result.updated;
```

The identity field must be a key of the item type, and custom comparison
functions receive inferred item parameters. Public result and option types are
available as named type imports when an explicit annotation is useful.

If you explicitly supply both item and mode type parameters, also supply the
matching `updatedValues` option. A type parameter alone cannot select a runtime
mode. Options whose mode is optional produce a union result type because the
default mode may be used.

The package uses ES modules. The `UpdatedValues` enum is also available as a named runtime import.

## Development and publishing

```bash
pnpm install --frozen-lockfile
npm test
npm pack --dry-run
```

Tests run lint, type checking, a clean build, coverage, and ESM package checks
against the compiled package. Packing also runs a clean build; publishing runs
the full test suite. The package is configured for public npm access. Before
publishing, verify that the scoped package name and version are correct, then
run `npm publish` while authenticated as an owner of that scope.

## Performance tests

Run `npm run bench` to build the package and measure its compiled implementation
without coverage instrumentation. The benchmark reports operations per second,
mean/min/max latency, percentiles, sample counts, and relative margin of error.
Save a baseline with `npm run bench -- --outputJson /tmp/diff-bench.json`, then
compare a later run with `npm run bench -- --compare /tmp/diff-bench.json`.

Fixtures contain 100 and 1,000 entries per object, each with strings, numbers,
booleans, bigints, null, undefined, NaN, infinity, symbol values, shared functions,
dates, regular expressions, Maps, Sets, arrays, and nested objects. Cases cover
equal inputs, sparse (1%) and dense (100%) updates, array classification, and
order-independent comparisons. Separate depths of 5, 10, 15, and 18 expose the
known nested-array performance regression.

Fixture creation is outside measured operations. The mutating order-independent
case receives fresh reversed inputs before every iteration. Benchmarks warm up
before sampling; results depend on hardware and system load, so compare runs on
the same machine. Timing thresholds do not gate `npm test`.

The unit suite checks large mixed objects, exact change counts, classification,
and apply/revert round trips. Three `it.fails` cases document the known collection
equality and exponential-traversal bugs; remove their expected-failure markers
when fixing those bugs. The traversal regression counts property reads instead
of relying on wall-clock timing.

## License

MIT
