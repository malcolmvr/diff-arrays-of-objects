const should = require('should');
const expect = require('expect.js');
const diff = require('../lib');

describe('diff-arrays-of-objects', function () {

  it('just one the same', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id');
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([{ id: 1, letter: 'a' }]);
  });

  it('just one removed', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [];
    const results = diff(first, second, 'id');
    should(results.added).be.eql([]);
    should(results.removed).be.eql([{ id: 1, letter: 'a' }]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one added', function () {
    const first = [];
    const second = [{ id: 1, letter: 'a' }];
    const results = diff(first, second, 'id');
    should(results.added).be.eql([{ id: 1, letter: 'a' }]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([]);
  });

  it('just one updated', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    const results = diff(first, second, 'id');
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([{ id: 1, letter: 'b' }]);
    should(results.same).be.eql([]);
  });

  it('just one updated; updatedValues.first', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.first });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([{ id: 1, letter: 'a' }]);
    should(results.same).be.eql([]);
  });

  it('just one updated; updatedValues.both', function () {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.both });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([[{ id: 1, letter: 'a' }, { id: 1, letter: 'b' }]]);
    should(results.same).be.eql([]);
  });

  it('just one updated; updatedValues.bothWithDeepDiff', function () {
    const first = [{ id: 1, details: { letter: 'a' } }];
    const second = [{ id: 1, details: { letter: 'b' } }];
    const results = diff(first, second, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated[0][0]).be.eql({ id: 1, details: { letter: 'a' } });
    should(results.updated[0][1]).be.eql({ id: 1, details: { letter: 'b' } });
    should(results.updated[0][2][0].kind).be.eql('E');
    should(results.updated[0][2][0].path).be.eql(['details', 'letter']);
    should(results.updated[0][2][0].lhs).be.eql('a');
    should(results.updated[0][2][0].rhs).be.eql('b');
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
    const results = diff(first, second, 'id');
    should(results.added).be.eql([{ id: 1, letter: 'a' }, { id: 2, letter: 'a' }]);
    should(results.removed).be.eql([{ id: 3, letter: 'a' }, { id: 4, letter: 'a' }]);
    should(results.updated).be.eql([{ id: 7, letter: 'b' }, { id: 8, letter: 'b' }]);
    should(results.same).be.eql([{ id: 5, letter: 'a' }, { id: 6, letter: 'a' }]);
  });

  it('custom compare function', function () {
    const first = [{ id: 1, letter: 'a', ignored: 'x' }];
    const second = [{ id: 1, letter: 'a', ignored: 'y' }];
    const compareFunction = (o1, o2) => {
      return o1.letter === o2.letter;
    };
    const results = diff(first, second, 'id', { compareFunction });
    should(results.added).be.eql([]);
    should(results.removed).be.eql([]);
    should(results.updated).be.eql([]);
    should(results.same).be.eql([{ id: 1, letter: 'a', ignored: 'y' }]);
  });

  it('should send an error when the first array is not an array', () => {
    expect(() => {
        const first = null;
        const second = [{ id: 1, letter: 'a' }];
        diff(first, second, 'id');
    }).to.throwError();
  });

  it('should send an error when the second array is not an array', () => {
      expect(() => {
          const first = [{ id: 1, letter: 'a' }];
          const second = null;
          diff(first, second, 'id');
      }).to.throwError();
  });

  it('should send an error when the idField is empty', () => {
      expect(() => {
          const first = [{ id: 1, letter: 'a' }];
          const second = [{ id: 1, letter: 'b' }];
          diff(first, second, null);
      }).to.throwError();
  });

  it('should send an error when the options is not an object', () => {
      expect(() => {
          const first = [{ id: 1, letter: 'a' }];
          const second = [{ id: 1, letter: 'b' }];
          diff(first, second, 'id', null);
      }).to.throwError();
  });

    it('should send an error when the options.updatedValues is not a valid value', () => {
        expect(() => {
            const first = [{ id: 1, letter: 'a' }];
            const second = [{ id: 1, letter: 'b' }];
            diff(first, second, 'id', { updatedValues: -1 });
        }).to.throwError();
    });

    it('should send an error when the options.compareFunction is not a valid function', () => {
        expect(() => {
            const first = [{ id: 1, letter: 'a' }];
            const second = [{ id: 1, letter: 'b' }];
            diff(first, second, 'id', { compareFunction: -1 });
        }).to.throwError();
    });
});
