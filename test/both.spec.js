const should = require('should');
const diff = require('../lib');

describe('both', function () {
  it('just one the same', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([{ id: 1, letter: 'a' }]);
  });

  it('just one removed', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([{ id: 1, letter: 'a' }]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one added', function () {
    const first = [];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([{ id: 1, letter: 'a' }]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one updated', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([[{ id: 1, letter: 'a' }, { id: 1, letter: 'b' }]]);
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
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([{ id: 1, letter: 'a' }, { id: 2, letter: 'a' }]);
    should(results.removed).be.eql([{ id: 3, letter: 'a' }, { id: 4, letter: 'a' }]);
    should(results.updated).be.eql([[{ id: 7, letter: 'a' }, { id: 7, letter: 'b' }], [{ id: 8, letter: 'a' }, { id: 8, letter: 'b' }]]);
    should(results.same).be.eql([{ id: 5, letter: 'a' }, { id: 6, letter: 'a' }]);
  });
});
