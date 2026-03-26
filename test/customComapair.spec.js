const should = require('should');
const diff = require('../lib');

describe('custom compare function', function () {
  it('should be able to use a custom compare function', function () {
    const first = [{ id: 1, letter: 'a', ignored: 'x' }];
    const second = [{ id: 1, letter: 'a', ignored: 'y' }];
    const compareFunction = (o1, o2) => {
      return o1.letter === o2.letter;
    };
    const results = diff(first, second, 'id', { compareFunction });
    should(results.added).be.deepEqual([]);
    should(results.removed).be.deepEqual([]);
    should(results.updated).be.deepEqual([]);
    should(results.same).be.deepEqual([{ id: 1, letter: 'a', ignored: 'y' }]);
  });
});
