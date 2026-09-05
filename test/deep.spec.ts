import { describe, expect, it } from 'vitest';

import diff from '../lib';

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
    const second = [];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([{ id: 1, letter: 'a' }]);
    expect(results.updated).toEqual([]);
    expect(results.same).toEqual([]);
  });

  it('just one added', function () {
    const first = [];
    const second = [{ id: 1, letter: 'a' }];
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
    expect(results.updated[0][0]).toEqual({ id: 1, details: { letter: 'a' } });
    expect(results.updated[0][1]).toEqual({ id: 1, details: { letter: 'b' } });
    if (results.updated[0][2] === undefined) {
      throw new Error('received undefined from deep diff this should not happen');
    }

    const deepDiff = results.updated[0][2][0];


    if (deepDiff.kind !== 'E') {
      throw new Error('received something else then then and edit return type');
    }

    expect(deepDiff.kind).toEqual('E');
    expect(deepDiff.path).toEqual(['details', 'letter']);
    expect(deepDiff.lhs).toEqual('a');
    expect(deepDiff.rhs).toEqual('b');
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
