import { expect, expectTypeOf, it } from 'vitest';
import diff, { UpdatedValues, type DeepDiffChange, type DiffResult, type Options } from '../dist/index.js';

it('exposes matching runtime exports and inferred types from the built package', () => {
  interface Item { id: number; name: string }
  const before: readonly Item[] = [{ id: 1, name: 'before' }];
  const after: readonly Item[] = [{ id: 1, name: 'after' }];

  expect(UpdatedValues).toBe(diff.updatedValues);
  expectTypeOf(diff(before, after).updated).toEqualTypeOf<Item[]>();
  expectTypeOf(diff(before, after, 'id', {
    updatedValues: UpdatedValues.first,
  }).updated).toEqualTypeOf<Item[]>();
  expectTypeOf(diff(before, after, 'id', {
    updatedValues: UpdatedValues.both,
  }).updated).toEqualTypeOf<[Item, Item][]>();
  const deep = diff(before, after, 'id', {
    updatedValues: UpdatedValues.bothWithDeepDiff,
    compareFunction: (left, right) => {
      expectTypeOf(left).toEqualTypeOf<Item>();
      expectTypeOf(right).toEqualTypeOf<Item>();
      return left.name === right.name;
    },
  });
  expectTypeOf(deep).toEqualTypeOf<DiffResult<Item, UpdatedValues.bothWithDeepDiff>>();
  expectTypeOf(deep.updated).toEqualTypeOf<[Item, Item, DeepDiffChange[]][]>();
  expect(deep.updated).toHaveLength(1);
});

it('keeps explicit and optional mode types consistent with runtime results', () => {
  interface Item { id: number; name: string }
  const before = [{ id: 1, name: 'before' }];
  const after = [{ id: 1, name: 'after' }];
  const both = diff<Item, UpdatedValues.both>(before, after, 'id', {
    updatedValues: UpdatedValues.both,
  });
  expectTypeOf(both.updated).toEqualTypeOf<[Item, Item][]>();
  expect(both.updated).toEqual([[before[0], after[0]]]);

  const detailed = diff<Item, UpdatedValues.bothWithDeepDiff>(before, after, 'id', {
    updatedValues: UpdatedValues.bothWithDeepDiff,
  });
  expectTypeOf(detailed.updated).toEqualTypeOf<[Item, Item, DeepDiffChange[]][]>();
  expect(detailed.updated).toEqual([[before[0], after[0], [
    { kind: 'E', path: ['name'], lhs: 'before', rhs: 'after' },
  ]]]);

  const options: Options<Item, UpdatedValues.both> = {};
  const optional = diff(before, after, 'id', options);
  // An optional runtime mode cannot promise tuple output.
  expectTypeOf(optional).toEqualTypeOf<DiffResult<Item>>();
  expect(optional.updated).toEqual(after);
  expectTypeOf(diff<Item>(before, after).updated).toEqualTypeOf<Item[]>();
});
