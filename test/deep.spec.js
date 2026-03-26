const should = require('should');
const diff = require('../lib');

describe('deep diff', function () {
  it('just one the same', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([{ id: 1, letter: 'a' }]);
  });

  it('just one removed', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([{ id: 1, letter: 'a' }]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one added', function () {
    const first = [];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    should(results.added).be.eql([{ id: 1, letter: 'a' }]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one updated', function () {
    const first = [{ id: 1, details: { letter: 'a' } }];
    const second = [{ id: 1, details: { letter: 'b' } }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });

    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated[0][0]).be.eql({ id: 1, details: { letter: 'a' } });
    should(results.updated[0][1]).be.eql({ id: 1, details: { letter: 'b' } });
    if (results.updated[0][2] === undefined) {
      throw new Error('received undefined from deep diff this should not happen');
    }

    const deepDiff = results.updated[0][2][0];


    if (deepDiff.kind !== 'E') {
      throw new Error('received something else then then and edit return type');
    }

    should(deepDiff.kind).be.eql('E');
    should(deepDiff.path).be.eql(['details', 'letter']);
    should(deepDiff.lhs).be.eql('a');
    should(deepDiff.rhs).be.eql('b');
    should(results.same).be.eql([]);
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
    should(results.added).be.deepEqual([{ id: 1, letter: 'a' }, { id: 2, letter: 'a' }]);
    should(results.removed).be.deepEqual([{ id: 3, letter: 'a' }, { id: 4, letter: 'a' }]);
    should(JSON.stringify(results.updated)).be.eql(JSON.stringify([
      [{ id: 7, letter: 'a' }, { id: 7, letter: 'b' }, [{ 'kind': 'E', 'path': ['letter'], 'lhs': 'a', 'rhs': 'b' }]],
      [{ id: 8, letter: 'a' }, { id: 8, letter: 'b' }, [{ 'kind': 'E', 'path': ['letter'], 'lhs': 'a', 'rhs': 'b' }]],
    ]));
    should(results.same).be.deepEqual([{ id: 5, letter: 'a' }, { id: 6, letter: 'a' }]);
  });


});
