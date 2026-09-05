import { describe, expect, it } from 'vitest';
import deep from '../lib/deep-diff';
import type { PreFilterObject } from '../lib/deep-diff/calculate';
import { arrayRemove } from '../lib/deep-diff/utils';

describe('deep-diff compatibility helpers', () => {
  it('applies every change kind, including nested array changes', () => {
    const target: any = {
      list: [{ value: 'old', obsolete: true, nested: [1], container: { value: 1 } }],
      matrices: [[1]],
      removeMe: true,
    };

    deep.applyChange(target, { kind: 'E', path: ['list', 0, 'value'], rhs: 'new' });
    deep.applyChange(target, true, { kind: 'N', path: ['created', 0, 'value'], rhs: 1 });
    deep.applyChange(target, true, { kind: 'D', path: ['removeMe'] });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'D', path: ['obsolete'], lhs: true },
    });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: {
        kind: 'A',
        path: ['nested'],
        index: 1,
        item: { kind: 'N', rhs: 2 },
      },
    });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'E', path: ['value'], lhs: 'new', rhs: 'newer' },
    });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'N', path: ['added'], rhs: true },
    });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'E', path: ['container', 'value'], rhs: 2 },
    });
    deep.applyChange(target, true, {
      kind: 'A',
      path: ['matrices'],
      index: 0,
      item: { kind: 'A', index: 0, item: { kind: 'E', rhs: 2 } },
    });

    expect(target).toEqual({
      list: [{ value: 'newer', nested: [1, 2], added: true, container: { value: 2 } }],
      matrices: [[2]],
      created: [{ value: 1 }],
    });

    const topLevel = [1, 2];
    deep.applyChange(topLevel, true, {
      kind: 'A', index: 0, item: { kind: 'E', lhs: 1, rhs: 3 },
    });
    deep.applyChange(topLevel, true, {
      kind: 'A', index: 1, item: { kind: 'N', rhs: 4 },
    });
    deep.applyChange(topLevel, true, {
      kind: 'A', index: 0, item: { kind: 'D', lhs: 3 },
    });
    expect(topLevel).toEqual([4]);

    deep.applyChange(null, true, { kind: 'N', path: ['ignored'], rhs: true });
    deep.applyChange({}, true, {});
  });

  it('reverts every change kind, including nested array changes', () => {
    const target: any = {
      edited: 'after',
      added: true,
      list: [{ value: 'after', added: true, nested: [1, 2], container: { value: 2 } }],
      matrices: [[2, 3]],
    };

    deep.revertChange(target, true, { kind: 'E', path: ['edited'], lhs: 'before' });
    deep.revertChange(target, true, { kind: 'D', path: ['restored'], lhs: true });
    deep.revertChange(target, true, { kind: 'N', path: ['added'], rhs: true });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'E', path: ['value'], lhs: 'before' },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'D', path: ['deleted'], lhs: true },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'N', path: ['added'] },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: {
        kind: 'A',
        path: ['nested'],
        index: 1,
        item: { kind: 'N' },
      },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['list'],
      index: 0,
      item: { kind: 'E', path: ['container', 'value'], lhs: 1 },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['matrices'],
      index: 0,
      item: { kind: 'A', index: 0, item: { kind: 'E', lhs: 1 } },
    });
    deep.revertChange(target, true, {
      kind: 'A',
      path: ['matrices'],
      index: 0,
      item: { kind: 'A', index: 1, item: { kind: 'D', lhs: 3 } },
    });
    deep.revertChange(target, true, { kind: 'D', path: ['missing', 'leaf'], lhs: true });

    expect(target).toEqual({
      edited: 'before',
      restored: true,
      list: [{ value: 'before', deleted: true, nested: [1], container: { value: 1 } }],
      matrices: [[1, 3]],
      missing: { leaf: true },
    });

    deep.revertChange(null, true, { kind: 'N', path: ['ignored'] });
    deep.revertChange({}, null, { kind: 'N', path: ['ignored'] });
    deep.revertChange({}, true, {});
  });

  it('ignores malformed paths and incompatible array targets', () => {
    const missingKey = Array<string>(1);
    const malformedApplyTarget = {
      list: [1, { primitive: 1 }],
    };

    deep.applyChange(malformedApplyTarget, true, {
      kind: 'E', path: [undefined, 'leaf'], rhs: true,
    });
    deep.applyChange(malformedApplyTarget, true, {
      kind: 'A', path: ['list'], index: 0,
      item: { kind: 'E', path: ['leaf'], lhs: false, rhs: true },
    });
    deep.applyChange(malformedApplyTarget, true, {
      kind: 'A', path: ['list'], index: 1,
      item: { kind: 'E', path: ['primitive', 'leaf'], lhs: false, rhs: true },
    });
    deep.applyChange(malformedApplyTarget, true, {
      kind: 'A', path: ['list'], index: 1,
      item: { kind: 'E', path: missingKey, lhs: false, rhs: true },
    });

    const malformedRevertTarget = {
      list: [1, { value: true }],
    };
    deep.revertChange(malformedRevertTarget, true, {
      kind: 'A', path: ['list'], index: 0,
      item: { kind: 'E', path: ['leaf'], lhs: false, rhs: true },
    });
    deep.revertChange(malformedRevertTarget, true, {
      kind: 'A', path: ['list'], index: 1,
      item: { kind: 'E', path: [undefined, 'leaf'], lhs: false, rhs: true },
    });
    deep.revertChange(malformedRevertTarget, true, {
      kind: 'A', path: ['list'], index: 1,
      item: { kind: 'E', path: missingKey, lhs: false, rhs: true },
    });
    deep.revertChange(malformedRevertTarget, true, {
      kind: 'E', path: [undefined, 'leaf'], lhs: false, rhs: true,
    });
    deep.revertChange([], true, {
      kind: 'A', index: 0, item: { kind: 'N', rhs: true },
    });

    expect(malformedApplyTarget).toEqual({ list: [1, { primitive: 1 }] });
    expect(malformedRevertTarget).toEqual({ list: [1, { value: true }] });
  });

  it('applies a complete diff conditionally', () => {
    const target = { keep: 1, update: 1 };
    const source = { keep: 2, update: 2, added: true };

    deep.applyDiff(target, source, (_target, _source, change) => change.path?.[0] !== 'keep');
    expect(target).toEqual({ keep: 1, update: 2, added: true });

    deep.applyDiff(null, source);
    deep.applyDiff(target, null);
  });

  it('supports object prefilters, normalizers, observers, and accumulators', () => {
    const prefilter: PreFilterObject = {
      prefilter: (_path, key) => key === 'ignored',
      normalize: (_path, key, lhs, rhs) => key === 'name'
        ? [String(lhs).toLowerCase(), String(rhs).toLowerCase()]
        : undefined,
    };

    expect(deep.diff(
      { ignored: 1, name: 'VALUE', changed: 1 },
      { ignored: 2, name: 'value', changed: 2 },
      prefilter,
    )).toEqual([{ kind: 'E', path: ['changed'], lhs: 1, rhs: 2 }]);

    const observed: any[] = [];
    const returned = deep.observableDiff({ a: 1 }, { a: 2 }, change => observed.push(change));
    expect(returned).toEqual(observed);

    const accumulated: any[] = [];
    expect(deep.diff({ a: 1 }, { a: 2 }, undefined, accumulated)).toBe(accumulated);
    expect(accumulated).toHaveLength(1);

    const orderedAccumulated: any[] = [];
    expect(deep.orderIndependentDiff([1], [2], undefined, orderedAccumulated))
      .toBe(orderedAccumulated);
    expect(orderedAccumulated).toHaveLength(1);
  });

  it('handles cycles and exposes the low-level order-independent walker', () => {
    const lhs: any = { value: 1 };
    const rhs: any = { value: 1 };
    lhs.self = lhs;
    rhs.self = rhs;
    expect(deep.diff(lhs, lhs)).toBeUndefined();
    expect(deep.diff(lhs, rhs)).toEqual([
      expect.objectContaining({ kind: 'E', path: ['self'] }),
    ]);

    const other: any = { value: 1 };
    other.self = { value: 1 };
    other.self.self = other.self;
    expect(deep.diff(lhs, other)).toEqual([
      expect.objectContaining({ kind: 'E', path: ['self'] }),
    ]);

    const changes: any[] = [];
    deep.orderIndependentObservableDiff([2, 1], [1, 3], changes);
    expect(changes).toHaveLength(1);
    expect(deep.orderIndependentObservableDiff([1], [1])).toBeUndefined();
  });

  it('reports global conflicts and covers array removal boundaries', () => {
    expect(deep.isConflict()).toBe(false);
    (globalThis as any).$conflict = true;
    try {
      expect(deep.isConflict()).toBe(true);
    } finally {
      delete (globalThis as any).$conflict;
    }

    expect(arrayRemove([0, 1, 2, 3], 1, 2)).toEqual([0, 3]);
    expect(arrayRemove([0, 1], -1)).toEqual([0]);
  });
});
