import { describe, expect, it } from 'vitest';
import diff from '../lib/index.js';
import deep from '../lib/deep-diff/index.js';

describe('deep-diff review regressions', () => {
  it('deletes own properties that shadow inherited properties', () => {
    const before = { id: 1, toString: 'custom' };
    const after = { id: 1 };
    const result = diff([before], [after], 'id', {
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    });
    expect(result.updated[0]?.[2]).toEqual([
      { kind: 'D', path: ['toString'], lhs: 'custom' },
    ]);
    const target = { ...before };
    deep.applyDiff(target, after);
    expect(Object.hasOwn(target, 'toString')).toBe(false);
    for (const change of result.updated[0]![2]) deep.revertChange(target, before, change);
    expect(target).toEqual(before);
    expect(deep(after, before)).toEqual([
      { kind: 'N', path: ['toString'], rhs: 'custom' },
    ]);
  });

  it('does not read inherited getters when an own property is removed', () => {
    const after: object = Object.create({
      get value () { throw new Error('inherited getter must not run'); },
    });
    expect(deep({ value: undefined }, after)).toEqual([
      { kind: 'D', path: ['value'], lhs: undefined },
    ]);
  });

  it.each([[/a/g, /b/i], [/a/g, /a/i]])('preserves regex values through apply and revert', (lhs, rhs) => {
    const before = { id: 1, pattern: lhs };
    const after = { id: 1, pattern: rhs };
    const changes = diff([before], [after], 'id', {
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    }).updated[0]![2];
    expect(changes).toEqual([{ kind: 'E', path: ['pattern'], lhs, rhs }]);
    const target = { ...before };
    for (const change of changes) deep.applyChange(target, change);
    expect(target.pattern).toBeInstanceOf(RegExp);
    expect(target).toEqual(after);
    for (const change of changes) deep.revertChange(target, before, change);
    expect(target).toEqual(before);
    expect(deep({ pattern: lhs }, { pattern: new RegExp(lhs) })).toBeUndefined();
  });

  it.each([
    [new Date(0), new Date(1)],
    [/a/g, /b/i],
    [new Map([['a', 1]]), new Map([['a', 2]])],
    [new Set([1]), new Set([2])],
    ['Aa', 'BB'],
    [{ values: [1, 2] }, { values: [3, 4] }],
  ])('matches reordered values despite hash collisions: %j', (first, second) => {
    expect(deep.orderIndependentDiff([first, second], [second, first])).toBeUndefined();
    expect(deep.orderIndependentDiff([first, first, second], [second, first, first]))
      .toBeUndefined();
    expect(deep.orderIndependentDiff([first, first], [first, second])).toBeDefined();
  });

  it('matches colliding objects with reordered nested arrays', () => {
    expect(deep.orderIndependentDiff(
      [{ values: [1, 2] }, { values: [3, 4] }],
      [{ values: [4, 3] }, { values: [2, 1] }],
    )).toBeUndefined();
  });
});
