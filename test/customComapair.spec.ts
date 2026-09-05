import { describe, expect, it } from 'vitest';
import diff from '../lib';

describe('custom compare function', function () {
  it('should be able to use a custom compare function', function () {
    const first = [{ id: 1, letter: 'a', ignored: 'x' }];
    const second = [{ id: 1, letter: 'a', ignored: 'y' }];
    const compareFunction = (o1: typeof first[number], o2: typeof first[number]) => {
      return o1.letter === o2.letter;
    };
    const results = diff(first, second, 'id', { compareFunction });
    expect(results.added).toEqual([]);
    expect(results.removed).toEqual([]);
    expect(results.updated).toEqual([]);
    expect(results.same).toEqual([{ id: 1, letter: 'a', ignored: 'y' }]);
  });
});

export {};
