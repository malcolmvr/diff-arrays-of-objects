import type { Diff } from './deep-diff-types';

/** How the `updated` array should be populated. */
// eslint-disable-next-line no-shadow
export enum UpdatedValues {
  first = 1,
  second = 2,
  both = 3,
  bothWithDeepDiff = 4,
}

/** A function that decides whether two objects are considered equal. */
export type CompareFunction<T> = (value: T, other: T) => boolean;

export interface Options<T> {
  compareFunction?: CompareFunction<T>;
  updatedValues?: UpdatedValues;
}

/** Resolved, validated options. */
export interface ResolvedOptions<T> {
  compareFunction: CompareFunction<T>;
  updatedValues: UpdatedValues;
}

/** Fields common to every diff result. */
export interface DiffResultBase<T> {
  added: T[];
  removed: T[];
  same: T[];
}

/** Result when `updatedValues` is `first` or `second`. */
export interface DiffResultNormal<T> extends DiffResultBase<T> {
  updated: T[];
}

/** Result when `updatedValues` is `both`. */
export interface DiffResultBoth<T> extends DiffResultBase<T> {
  updated: [T, T][];
}

/** A single change reported by the deep diff. */
export type DeepDiffChange = Diff;

/** Result when `updatedValues` is `bothWithDeepDiff`. */
export interface DiffResultDeepDiff<T> extends DiffResultBase<T> {
  updated: [T, T, DeepDiffChange[]][];
}

export type DiffResult<T> =
  | DiffResultNormal<T>
  | DiffResultBoth<T>
  | DiffResultDeepDiff<T>;
