import { describe, expect, it } from 'vitest';
import diff, { UpdatedValues } from '../lib';
import { formatUpdated } from '../lib/format-updated';

describe('edge cases', function () {
  it('matches objects with falsey identifiers', function () {
    const first = [
      { id: 0, value: 'before' },
      { id: '', value: 'unchanged' },
    ];
    const second = [
      { id: 0, value: 'after' },
      { id: '', value: 'unchanged' },
    ];

    const results = diff(first, second);

    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([]);
    expect(results.updated).toEqual([{ id: 0, value: 'after' }]);
    expect(results.same).toEqual([{ id: '', value: 'unchanged' }]);
  });

  it('returns an empty deep diff when a custom comparator forces equal values to be updated', function () {
    const item = { id: 1, value: 'same' };
    const results = diff([item], [{ ...item }], 'id', {
      compareFunction: () => false,
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    });

    expect(results.updated).toEqual([[item, { ...item }, []]]);
  });

  it('defensively rejects an unknown update formatting mode', function () {
    expect(() => formatUpdated([], {}, 'id', 999 as UpdatedValues))
      .toThrowError(/without taking a branch/);
  });
});

