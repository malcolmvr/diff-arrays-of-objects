import expect from 'expect.js';
import should from 'should';
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

    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([{ id: 0, value: 'after' }]);
    should(results.same).be.eql([{ id: '', value: 'unchanged' }]);
  });

  it('returns an empty deep diff when a custom comparator forces equal values to be updated', function () {
    const item = { id: 1, value: 'same' };
    const results = diff([item], [{ ...item }], 'id', {
      compareFunction: () => false,
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    });

    should(results.updated).be.eql([[item, { ...item }, []]]);
  });

  it('defensively rejects an unknown update formatting mode', function () {
    expect(() => formatUpdated([], {}, 'id', 999 as UpdatedValues))
      .to.throwError(/without taking a branch/);
  });
});

