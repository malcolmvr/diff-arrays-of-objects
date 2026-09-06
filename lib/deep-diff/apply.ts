import { Diff, PathSegment, validKinds } from './changes.js';
import { observableDiff } from './calculate.js';
import { arrayRemove } from './utils.js';

type Container = Record<PropertyKey, unknown> | unknown[];

export type ApplyFilter = (
  target: object,
  source: object,
  change: Diff,
) => boolean;

function isContainer (value: unknown): value is Container {
  return typeof value === 'object' && value !== null;
}

function get (value: Container, key: PathSegment): unknown {
  assertSafeKey(key);
  return Object.hasOwn(value, key) ? Reflect.get(value, key) : undefined;
}

function set (value: Container, key: PathSegment, item: unknown): void {
  assertSafeKey(key);
  Reflect.set(value, key, item);
}

function remove (value: Container, key: PathSegment): void {
  assertSafeKey(key);
  Reflect.deleteProperty(value, key);
}

function assertSafeKey (key: PathSegment): void {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    throw new Error(`Unsafe change path segment: ${key}`);
  }
}

function descend (
  root: Container,
  path: readonly PathSegment[],
  createMissing: boolean,
): Container | undefined {
  let current = root;
  for (let index = 0; index < path.length; index++) {
    const key = path[index];
    if (key === undefined) return undefined;
    let next = get(current, key);
    if (!isContainer(next) && createMissing) {
      next = typeof path[index + 1] === 'number' ? [] : {};
      set(current, key, next);
    }
    if (!isContainer(next)) return undefined;
    current = next;
  }
  return current;
}

function applyArrayChange (
  array: unknown[],
  index: number,
  change: Diff,
): void {
  const path = change.path ?? [];
  if (path.length) {
    const target = get(array, index);
    if (!isContainer(target)) return;
    const parent = descend(target, path.slice(0, -1), false);
    const key = path[path.length - 1];
    if (!parent || key === undefined) return;

    if (change.kind === 'A') {
      const nested = get(parent, key);
      if (Array.isArray(nested)) applyArrayChange(nested, change.index, change.item);
    } else if (change.kind === 'D') {
      remove(parent, key);
    } else if (change.kind === 'E' || change.kind === 'N') {
      set(parent, key, change.rhs);
    }
    return;
  }

  if (change.kind === 'A') {
    const nested = get(array, index);
    if (Array.isArray(nested)) applyArrayChange(nested, change.index, change.item);
  } else if (change.kind === 'D') {
    arrayRemove(array, index);
  } else {
    set(array, index, change.rhs);
  }
}

function resolveChange (source: unknown, suppliedChange?: unknown): Diff | undefined {
  const change = suppliedChange ?? source;
  if (isContainer(change)) {
    const kind = Reflect.get(change, 'kind');
    if (typeof kind === 'string' && validKinds.includes(kind as Diff['kind'])) {
      return change as unknown as Diff;
    }
  }
  return undefined;
}

export function applyChange (
  target: unknown,
  source?: unknown,
  suppliedChange?: unknown,
): void {
  const change = resolveChange(source, suppliedChange);
  if (!isContainer(target) || !change) return;

  const path = change.path ?? [];
  const parent = descend(target, path.slice(0, -1), true);
  if (!parent) return;
  const key = path[path.length - 1];

  if (change.kind === 'A') {
    let array = key === undefined ? parent : get(parent, key);
    if (!Array.isArray(array) && key !== undefined) {
      array = [];
      set(parent, key, array);
    }
    if (Array.isArray(array)) applyArrayChange(array, change.index, change.item);
  } else if (key !== undefined && change.kind === 'D') {
    remove(parent, key);
  } else if (key !== undefined
    && (change.kind === 'E' || change.kind === 'N')) {
    set(parent, key, change.rhs);
  }
}

function revertArrayChange (
  array: unknown[],
  index: number,
  change: Diff,
): void {
  const path = change.path ?? [];
  if (path.length) {
    const target = get(array, index);
    if (!isContainer(target)) return;
    const parent = descend(target, path.slice(0, -1), true);
    const key = path[path.length - 1];
    if (!parent || key === undefined) return;

    if (change.kind === 'A') {
      const nested = get(parent, key);
      if (Array.isArray(nested)) revertArrayChange(nested, change.index, change.item);
    } else if (change.kind === 'N') {
      remove(parent, key);
    } else if (change.kind === 'D' || change.kind === 'E') {
      set(parent, key, change.lhs);
    }
    return;
  }

  if (change.kind === 'A') {
    const nested = get(array, index);
    if (Array.isArray(nested)) revertArrayChange(nested, change.index, change.item);
  } else if (change.kind === 'N') {
    arrayRemove(array, index);
  } else {
    set(array, index, change.lhs);
  }
}

export function revertChange (
  target: unknown,
  source: unknown,
  suppliedChange: unknown,
): void {
  const change = resolveChange(suppliedChange);
  if (!source || !isContainer(target) || !change) return;
  const path = change.path ?? [];
  const parent = descend(target, path.slice(0, -1), true);
  const key = path[path.length - 1];
  if (!parent) return;

  if (change.kind === 'A') {
    const array = key === undefined ? parent : get(parent, key);
    if (Array.isArray(array)) revertArrayChange(array, change.index, change.item);
  } else if (key !== undefined && change.kind === 'N') {
    remove(parent, key);
  } else if (key !== undefined
    && (change.kind === 'D' || change.kind === 'E')) {
    set(parent, key, change.lhs);
  }
}

export function applyDiff (
  target: unknown,
  source: unknown,
  filter?: ApplyFilter,
): void {
  if (!isContainer(target) || !isContainer(source)) return;
  observableDiff(target, source, (change) => {
    if (!filter || filter(target, source, change)) {
      applyChange(target, source, change);
    }
  });
}
