import { describe, expect, it } from 'vitest';

import diff from '../lib/index.js';

describe('deep diff', function () {
  it('just one the same', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([]);
    expect(results.updated).toEqual([]);
    expect(results.same).toEqual([{ id: 1, letter: 'a' }]);
  });

  it('just one removed', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second: typeof first = [];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([{ id: 1, letter: 'a' }]);
    expect(results.updated).toEqual([]);
    expect(results.same).toEqual([]);
  });

  it('just one added', function () {
    const second = [{ id: 1, letter: 'a' }];
    const first: typeof second = [];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    expect(results.added).toEqual([{ id: 1, letter: 'a' }]);
    expect(results.removed).toEqual([]);
    expect(results.updated).toEqual([]);
    expect(results.same).toEqual([]);
  });

  it('just one updated', function () {
    const first = [{ id: 1, details: { letter: 'a' } }];
    const second = [{ id: 1, details: { letter: 'b' } }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });

    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([]);
    const update = results.updated[0];
    if (update === undefined) throw new Error('expected an updated item');
    expect(update[0]).toEqual({ id: 1, details: { letter: 'a' } });
    expect(update[1]).toEqual({ id: 1, details: { letter: 'b' } });

    const change = update[2][0];
    if (change?.kind !== 'E') {
      throw new Error('received something else then then and edit return type');
    }

    expect(change.kind).toEqual('E');
    expect(change.path).toEqual(['details', 'letter']);
    expect(change.lhs).toEqual('a');
    expect(change.rhs).toEqual('b');
    expect(results.same).toEqual([]);
  });

  it('two of each', function () {
    const first = [
      { id: 3, letter: 'a' },
      { id: 4, letter: 'a' },
      { id: 5, letter: 'a' },
      { id: 6, letter: 'a' },
      { id: 7, letter: 'a' },
      { id: 8, letter: 'a' },
    ];
    const second = [
      { id: 1, letter: 'a' },
      { id: 2, letter: 'a' },
      { id: 5, letter: 'a' },
      { id: 6, letter: 'a' },
      { id: 7, letter: 'b' },
      { id: 8, letter: 'b' },
    ];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    expect(results.added).toEqual([{ id: 1, letter: 'a' }, { id: 2, letter: 'a' }]);
    expect(results.removed).toEqual([{ id: 3, letter: 'a' }, { id: 4, letter: 'a' }]);
    expect(JSON.stringify(results.updated)).toEqual(JSON.stringify([
      [{ id: 7, letter: 'a' }, { id: 7, letter: 'b' }, [{ 'kind': 'E', 'path': ['letter'], 'lhs': 'a', 'rhs': 'b' }]],
      [{ id: 8, letter: 'a' }, { id: 8, letter: 'b' }, [{ 'kind': 'E', 'path': ['letter'], 'lhs': 'a', 'rhs': 'b' }]],
    ]));
    expect(results.same).toEqual([{ id: 5, letter: 'a' }, { id: 6, letter: 'a' }]);
  });


});

export {};
