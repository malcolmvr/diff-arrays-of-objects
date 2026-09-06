import isEqual from 'lodash/isEqual.js';
import { Diff, DiffArray, DiffDeleted, DiffEdit, DiffNew, PathSegment } from './changes.js';
import { getOrderIndependentHash } from './hash.js';
import { realTypeOf } from './utils.js';

export type PreFilterFunction = (
  path: readonly PathSegment[],
  key: PathSegment,
) => boolean;

export interface PreFilterObject {
  prefilter?: PreFilterFunction;
  normalize?: (
    path: readonly PathSegment[],
    key: PathSegment,
    lhs: unknown,
    rhs: unknown,
  ) => readonly [unknown, unknown] | undefined;
}

export type PreFilter = PreFilterFunction | PreFilterObject;
export type Observer = (change: Diff) => void;

interface StackEntry {
  lhs: object;
  rhs: object;
}

interface WalkOptions {
  changes: Diff[];
  prefilter: PreFilter | undefined;
  path: PathSegment[];
  stack: StackEntry[];
  orderIndependent: boolean;
}

function ownsKey (value: object, key: PathSegment | undefined): boolean {
  return key !== undefined
    && Object.getOwnPropertyDescriptor(value, key) !== undefined;
}

function shouldSkip (
  prefilter: PreFilter | undefined,
  path: readonly PathSegment[],
  key: PathSegment,
): boolean {
  if (typeof prefilter === 'function') return prefilter(path, key);
  return prefilter?.prefilter?.(path, key) ?? false;
}

function normalize (
  prefilter: PreFilter | undefined,
  path: readonly PathSegment[],
  key: PathSegment,
  lhs: unknown,
  rhs: unknown,
): readonly [unknown, unknown] | undefined {
  return typeof prefilter === 'object'
    ? prefilter.normalize?.(path, key, lhs, rhs)
    : undefined;
}

function compareArrays (
  lhs: unknown[],
  rhs: unknown[],
  options: WalkOptions,
): void {
  if (options.orderIndependent) {
    lhs.sort((a, b) => getOrderIndependentHash(a) - getOrderIndependentHash(b));
    rhs.sort((a, b) => getOrderIndependentHash(a) - getOrderIndependentHash(b));

    // Hashes only group candidates: distinct values can share a hash. Align
    // equal values within each group before comparing them by array index.
    for (let index = 0; index < Math.min(lhs.length, rhs.length); index++) {
      const hash = getOrderIndependentHash(lhs[index]);
      for (let candidate = index; candidate < rhs.length
        && getOrderIndependentHash(rhs[candidate]) === hash; candidate++) {
        const changes: Diff[] = [];
        walk(lhs[index], rhs[candidate], {
          ...options,
          changes,
          prefilter: undefined,
        }, index);
        if (changes.length === 0) {
          [rhs[index], rhs[candidate]] = [rhs[candidate], rhs[index]];
          break;
        }
      }
    }
  }

  let rightIndex = rhs.length - 1;
  let leftIndex = lhs.length - 1;
  while (rightIndex > leftIndex) {
    options.changes.push(new DiffArray(
      options.path,
      rightIndex,
      new DiffNew(undefined, rhs[rightIndex--]),
    ));
  }
  while (leftIndex > rightIndex) {
    options.changes.push(new DiffArray(
      options.path,
      leftIndex,
      new DiffDeleted(undefined, lhs[leftIndex--]),
    ));
  }
  for (; rightIndex >= 0; rightIndex--) {
    walk(lhs[rightIndex], rhs[rightIndex], {
      ...options,
      path: [...options.path],
    }, rightIndex);
  }
}

function compareObjects (
  lhs: object,
  rhs: object,
  options: WalkOptions,
): void {
  const left = lhs as Record<string, unknown>;
  const right = rhs as Record<string, unknown>;
  const remainingRightKeys = new Set(Object.keys(right));

  Object.keys(left).forEach((key) => {
    walk(left[key], ownsKey(right, key) ? right[key] : undefined, {
      ...options,
      path: [...options.path],
    }, key);
    remainingRightKeys.delete(key);
  });

  remainingRightKeys.forEach((key) => {
    walk(undefined, right[key], {
      ...options,
      path: [...options.path],
    }, key);
  });
}

function walk (
  initialLhs: unknown,
  initialRhs: unknown,
  options: WalkOptions,
  key?: PathSegment,
): void {
  const currentPath = [...options.path];
  let lhs = initialLhs;
  let rhs = initialRhs;

  if (key !== undefined) {
    if (shouldSkip(options.prefilter, currentPath, key)) return;
    const normalized = normalize(options.prefilter, currentPath, key, lhs, rhs);
    if (normalized) [lhs, rhs] = normalized;
    currentPath.push(key);
  }

  if (lhs instanceof RegExp && rhs instanceof RegExp) {
    if (lhs.toString() !== rhs.toString()) {
      options.changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
    return;
  }

  const parent = options.stack[options.stack.length - 1];
  const leftDefined = lhs !== undefined
    || (parent !== undefined && ownsKey(parent.lhs, key));
  const rightDefined = rhs !== undefined
    || (parent !== undefined && ownsKey(parent.rhs, key));

  if (!leftDefined && rightDefined) {
    options.changes.push(new DiffNew(currentPath, rhs));
    return;
  }
  if (!rightDefined && leftDefined) {
    options.changes.push(new DiffDeleted(currentPath, lhs));
    return;
  }
  if (realTypeOf(lhs) !== realTypeOf(rhs)) {
    options.changes.push(new DiffEdit(currentPath, lhs, rhs));
    return;
  }
  if (lhs instanceof Date && rhs instanceof Date) {
    if (lhs.getTime() !== rhs.getTime()) {
      options.changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
    return;
  }

  // Collection entries are not enumerable properties. Represent changes as a
  // replacement so applying and reverting them preserves their native type.
  if (lhs instanceof Map || rhs instanceof Map
    || lhs instanceof Set || rhs instanceof Set) {
    if (!isEqual(lhs, rhs)) {
      options.changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
    return;
  }

  if (typeof lhs === 'object' && lhs !== null
    && typeof rhs === 'object' && rhs !== null) {
    const alreadyVisited = options.stack.some(entry => entry.lhs === lhs);
    if (alreadyVisited) {
      if (lhs !== rhs) options.changes.push(new DiffEdit(currentPath, lhs, rhs));
      return;
    }

    const nestedOptions = {
      ...options,
      path: currentPath,
      stack: [...options.stack, { lhs, rhs }],
    };
    if (Array.isArray(lhs) && Array.isArray(rhs)) {
      compareArrays(lhs, rhs, nestedOptions);
    } else {
      compareObjects(lhs, rhs, nestedOptions);
    }
    return;
  }

  if (lhs !== rhs && !(typeof lhs === 'number' && Number.isNaN(lhs)
    && typeof rhs === 'number' && Number.isNaN(rhs))) {
    options.changes.push(new DiffEdit(currentPath, lhs, rhs));
  }
}

/** Recursively records structural differences between two values. */
export function deepDiff (
  lhs: unknown,
  rhs: unknown,
  changes: Diff[] = [],
  prefilter?: PreFilter,
  path: PathSegment[] = [],
  key?: PathSegment,
  stack: StackEntry[] = [],
  orderIndependent = false,
): void {
  walk(lhs, rhs, { changes, prefilter, path, stack, orderIndependent }, key);
}

export function observableDiff (
  lhs: unknown,
  rhs: unknown,
  observer?: Observer,
  prefilter?: PreFilter,
  orderIndependent = false,
): Diff[] {
  const changes: Diff[] = [];
  deepDiff(lhs, rhs, changes, prefilter, [], undefined, [], orderIndependent);
  changes.forEach(change => observer?.(change));
  return changes;
}

export function orderIndependentDeepDiff (
  lhs: unknown,
  rhs: unknown,
  changes: Diff[] = [],
  prefilter?: PreFilter,
  path: PathSegment[] = [],
  key?: PathSegment,
  stack: StackEntry[] = [],
): void {
  deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);
}

export function accumulateDiff (
  lhs: unknown,
  rhs: unknown,
  prefilter?: PreFilter,
  accumulator?: Diff[],
): Diff[] | undefined {
  const changes = observableDiff(lhs, rhs, undefined, prefilter);
  if (accumulator) {
    accumulator.push(...changes);
    return accumulator;
  }
  return changes.length ? changes : undefined;
}

export function accumulateOrderIndependentDiff (
  lhs: unknown,
  rhs: unknown,
  prefilter?: PreFilter,
  accumulator?: Diff[],
): Diff[] | undefined {
  const changes = observableDiff(lhs, rhs, undefined, prefilter, true);
  if (accumulator) {
    accumulator.push(...changes);
    return accumulator;
  }
  return changes.length ? changes : undefined;
}
