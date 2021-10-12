const diff = require('../lib');
const expect = require('expect.js');

describe('diff-arrays-of-objects', function () {
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
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    expect(() => {
      diff(first, second, 'id', { updatedValues: -1 });
    }).to.throwError();
    expect(() => {
      diff(first, second, 'id', { updatedValues: 10 });
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
