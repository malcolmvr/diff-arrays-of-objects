import { describe, expect, it } from 'vitest';
import diff from '../lib/index.js';
import deep from '../lib/deep-diff/index.js';

describe('safe patch paths', () => {
  it.each(['__proto__', 'constructor', 'prototype'])('rejects unsafe segment %s', (key) => {
    for (const path of [[key], [key, 'polluted']]) {
      const change = { kind: 'E', path, lhs: true, rhs: true };
      expect(() => deep.applyChange({}, change)).toThrow(/Unsafe change path/);
      expect(() => deep.revertChange({}, true, change)).toThrow(/Unsafe change path/);
    }
    expect(() => deep.applyChange({}, { kind: 'D', path: [key] }))
      .toThrow(/Unsafe change path/);
    expect(() => deep.revertChange({}, true, { kind: 'N', path: [key] }))
      .toThrow(/Unsafe change path/);
    const nested = {
      kind: 'A', path: ['items'], index: 0,
      item: { kind: 'E', path: [key, 'polluted'], lhs: true, rhs: true },
    };
    expect(() => deep.applyChange({ items: [{}] }, nested)).toThrow(/Unsafe change path/);
    expect(() => deep.revertChange({ items: [{}] }, true, nested)).toThrow(/Unsafe change path/);
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
  });

  it('rejects unsafe keys from parsed JSON in applyDiff', () => {
    const source: unknown = JSON.parse('{"__proto__":{"polluted":true}}');
    expect(() => deep.applyDiff({}, source)).toThrow(/Unsafe change path/);
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);
  });

  it('creates own containers instead of modifying inherited objects', () => {
    const prototype = { nested: { value: 1 } };
    const target: object = Object.create(prototype);
    deep.applyChange(target, { kind: 'E', path: ['nested', 'value'], rhs: 2 });
    expect(prototype.nested.value).toBe(1);
    expect(target).toEqual({ nested: { value: 2 } });
  });
});

describe('collection changes', () => {
  it.each([
    [new Map([['a', 1]]), new Map([['a', 2]])],
    [new Set([1]), new Set([2])],
    [{}, new Map([['a', 1]])],
    [{}, new Set([1])],
    [new Map(), new Set()],
  ])('represents changed collections as reversible replacements', (lhs, rhs) => {
    const before = { id: 1, value: lhs };
    const after = { id: 1, value: rhs };
    const result = diff([before], [after], 'id', {
      updatedValues: diff.updatedValues.bothWithDeepDiff,
    });
    const changes = result.updated[0]?.[2];
    expect(changes).toEqual([{ kind: 'E', path: ['value'], lhs, rhs }]);
    const target = { ...before };
    for (const change of changes ?? []) deep.applyChange(target, change);
    expect(target).toEqual(after);
    for (const change of changes ?? []) deep.revertChange(target, before, change);
    expect(target).toEqual(before);
  });

  it.each([new Map([['a', 1]]), new Set([1])])('does not report equal collections', (value) => {
    expect(deep({ value }, { value: structuredClone(value) })).toBeUndefined();
  });
});
