import diff from '../lib';
import { describe, expect, it } from 'vitest';

describe('diff-arrays-of-objects', function () {
  it('should send an error when the first array is not an array', () => {
    expect(() => {
      const first = null;
      const second = [{ id: 1, letter: 'a' }];
      // @ts-expect-error Exercising runtime validation with a null array.
      diff(first, second, 'id');
    }).toThrowError();
  });

  it('should send an error when the second array is not an array', () => {
    expect(() => {
      const first = [{ id: 1, letter: 'a' }];
      const second = null;
      // @ts-expect-error Exercising runtime validation with a null array.
      diff(first, second, 'id');
    }).toThrowError();
  });

  it('should send an error when the idField is empty', () => {
    expect(() => {
      const first = [{ id: 1, letter: 'a' }];
      const second = [{ id: 1, letter: 'b' }];
      // @ts-expect-error Exercising runtime validation with a null key.
      diff(first, second, null);
    }).toThrowError();
  });

  it('should send an error when the options is not an object', () => {
    expect(() => {
      const first = [{ id: 1, letter: 'a' }];
      const second = [{ id: 1, letter: 'b' }];
      // @ts-expect-error Exercising runtime validation with null options.
      diff(first, second, 'id', null);
    }).toThrowError();
  });

  it('should send an error when the options.updatedValues is not a valid value', () => {
    const first = [{ id: 1, letter: 'a' }];
    const second = [{ id: 1, letter: 'b' }];
    expect(() => {
      // @ts-expect-error Exercising runtime validation with an invalid enum.
      diff(first, second, 'id', { updatedValues: -1 });
    }).toThrowError();
    expect(() => {
      // @ts-expect-error Exercising runtime validation with an invalid enum.
      diff(first, second, 'id', { updatedValues: 10 });
    }).toThrowError();
  });

  it('should send an error when the options.compareFunction is not a valid function', () => {
    expect(() => {
      const first = [{ id: 1, letter: 'a' }];
      const second = [{ id: 1, letter: 'b' }];
      // @ts-expect-error Exercising runtime validation with a non-function.
      diff(first, second, 'id', { compareFunction: -1 });
    }).toThrowError();
  });

  it('should use all the default parameter values', () => {
    expect(() => {
      diff();
    }).not.toThrowError();
  });
});

export {};
