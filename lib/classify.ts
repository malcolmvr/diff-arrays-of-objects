import { difference, groupBy, keyBy, map } from 'lodash';
import { DeepDiffChange, UpdatedValues } from './types';
// The vendored `deep-diff.ts` is a UMD module kept around for the legacy
// `test/deep-diff.spec.ts` runtime; it has no TS exports, so we load it
// via a default import cast to `any`.
import deepDiffModule from './deep-diff';
const deepDiff = deepDiffModule as any;

/** Extracts the id of an object using the configured id field. */
export function getId<T> (idField: string): (item: T) => string | number {
  return (item: T) => (item as Record<string, string | number>)[idField];
}

export interface Classification<T> {
  added: T[];
  same: T[];
  updated: T[];
}

/**
 * Classifies every object in `second` as added, same or updated,
 * relative to the objects indexed from `first`.
 */
export function classify<T> (
  second: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
  compareFunction: (a: T, b: T) => boolean,
): Classification<T> {
  const groupingFunction = (o2: T): string => {
    const o1 = firstIndex[String(getId<T>(idField)(o2))];
    if (!o1) return 'added';
    if (compareFunction(o1, o2)) return 'same';
    return 'updated';
  };

  return {
    added: [],
    same: [],
    updated: [],
    ...groupBy(second, groupingFunction),
  };
}

/** Formats the `updated` array according to the chosen `UpdatedValues` mode. */
export function formatUpdated<T> (
  updated: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
  updatedValues: UpdatedValues,
): T[] | [T, T][] | [T, T, DeepDiffChange[]][] {
  switch (updatedValues) {
    case UpdatedValues.first:
      return updated.map(u => firstIndex[String(getId<T>(idField)(u))]);

    case UpdatedValues.second:
      return [...updated];

    case UpdatedValues.both:
      return updated.map(
        u => [firstIndex[String(getId<T>(idField)(u))], u] as [T, T],
      );

    case UpdatedValues.bothWithDeepDiff:
      return updated.map((u) => {
        const firstItem = firstIndex[String(getId<T>(idField)(u))];
        const deepDiffResult = deepDiff(firstItem, u) ?? [];
        return [firstItem, u, deepDiffResult] as [T, T, DeepDiffChange[]];
      });

    default:
      throw new Error(
        'diff-arrays-of-objects error: reached the end of the UpdatedValues switch statement without taking a branch',
      );
  }
}

/** Computes the `removed` list: items in `first` whose ids are absent from `second`. */
export function findRemoved<T> (
  first: readonly T[],
  second: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
): T[] {
  const firstIds = first.map(getId<T>(idField));
  const secondIds = new Set(second.map(getId<T>(idField)));
  const removedIds = difference(firstIds, [...secondIds]);
  return map(removedIds, (id: string | number) => firstIndex[String(id)]);
}

/** Indexes an array of objects by their id field. */
export function indexById<T> (
  items: readonly T[],
  idField: string,
): Record<string, T> {
  return keyBy(items, getId<T>(idField)) as Record<string, T>;
}
