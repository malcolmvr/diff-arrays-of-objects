import { describe, expect, it } from 'vitest';
import diff from '../lib/index.js';
import deep from '../lib/deep-diff/index.js';
import { changeMixedObject, mixedEntry, mixedObject } from './fixtures/mixed-values.js';

describe('large objects containing mixed value types', () => {
  it('compares independently allocated equal objects', () => {
    const before = mixedObject(1000);
    const after = mixedObject(1000);
    expect(before.entries[0]!.map).not.toBe(after.entries[0]!.map);
    expect(deep(before, after)).toBeUndefined();
    expect(diff([before], [after])).toEqual({
      added: [], removed: [], updated: [], same: [after],
    });
  });

  it.each([1, 100])('finds and round-trips changes at stride %i', (stride) => {
    const before = mixedObject(1000);
    const after = mixedObject(1000);
    changeMixedObject(after, stride);
    const result = diff([before], [after], 'id', {
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    });
    expect(result.updated).toHaveLength(1);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.same).toEqual([]);
    const changes = result.updated[0]![2];
    expect(changes).toHaveLength(1000 / stride * 10);
    expect(changes.filter(change => change.kind === 'E')).toHaveLength(1000 / stride * 8);
    expect(changes.filter(change => change.kind === 'N')).toHaveLength(1000 / stride);
    expect(changes.filter(change => change.kind === 'D')).toHaveLength(1000 / stride);
    expect(changes).toContainEqual({
      kind: 'E', path: ['entries', 0, 'largeInteger'],
      lhs: BigInt(0), rhs: BigInt(1),
    });

    const target = mixedObject(1000);
    for (const change of changes) deep.applyChange(target, change);
    expect(target).toEqual(after);
    for (const change of [...changes].reverse()) deep.revertChange(target, before, change);
    expect(target).toEqual(before);
    expect(before).toEqual(mixedObject(1000));
  });

  it('classifies large arrays of mixed records in all four categories', () => {
    const before = mixedObject(1000).entries;
    const after = mixedObject(1000).entries.slice(100);
    after[0]!.text = 'changed';
    after.push(...Array.from({ length: 100 }, (_, index) => mixedEntry(index + 1000)));
    const result = diff(before, after);
    expect(result.removed).toEqual(before.slice(0, 100));
    expect(result.added).toEqual(after.slice(900));
    expect(result.updated).toEqual([after[0]]);
    expect(result.same).toEqual(after.slice(1, 900));
  });

  it('ignores reordered entries and nested arrays in order-independent mode', () => {
    const before = mixedObject(100);
    const after = mixedObject(100);
    after.entries.reverse();
    for (const entry of after.entries) {
      entry.matrix.reverse();
      for (const row of entry.matrix) row.reverse();
      entry.nested.metadata.tags.reverse();
    }
    expect(deep.orderIndependentDiff(before, after)).toBeUndefined();
  });
});

describe('known review regressions (expected failures until fixed)', () => {
  it.fails('distinguishes Map keys from their values', () => {
    const lhs = new Map([['a', 'b']]);
    const rhs = new Map([['b', 'a']]);
    expect(deep({ value: lhs }, { value: rhs })).toEqual([
      { kind: 'E', path: ['value'], lhs, rhs },
    ]);
  });

  it.fails('preserves array order inside Sets during ordinary comparison', () => {
    const lhs = new Set([[1, 2]]);
    const rhs = new Set([[2, 1]]);
    expect(deep({ value: lhs }, { value: rhs })).toEqual([
      { kind: 'E', path: ['value'], lhs, rhs },
    ]);
  });

  it.fails('avoids exponential traversal of nested singleton arrays', () => {
    const countReads = (depth: number): number => {
      let reads = 0;
      let lhs: unknown = { get value () { reads++; return 1; } };
      let rhs: unknown = { get value () { reads++; return 1; } };
      for (let index = 0; index < depth; index++) { lhs = [lhs]; rhs = [rhs]; }
      expect(deep.orderIndependentDiff(lhs, rhs)).toBeUndefined();
      return reads;
    };
    // A deterministic work bound avoids machine-dependent timing assertions.
    expect(countReads(10)).toBeLessThanOrEqual(countReads(5) * 4);
  });
});
