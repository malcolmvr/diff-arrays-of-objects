import { classify } from './classify.js';
import { formatUpdated, UpdatedEntry } from './format-updated.js';
import { findRemoved, indexById } from './identity.js';
import {
  DEFAULT_ID_FIELD,
  Options,
  resolveOptions,
  UpdatedValues,
} from './resolve-options.js';

export {
  CompareFunction,
  Options,
  ResolvedOptions,
  UpdatedValues,
} from './resolve-options.js';
export type { Diff as DeepDiffChange } from './deep-diff/changes.js';

export interface DiffResult<
  T,
  Mode extends UpdatedValues = UpdatedValues,
> {
  added: T[];
  removed: T[];
  same: T[];
  updated: UpdatedEntry<T, Mode>[];
}

export type DiffResultBase<T> = Pick<DiffResult<T>, 'added' | 'removed' | 'same'>;
export type DiffResultNormal<T> = DiffResult<T, UpdatedValues.first | UpdatedValues.second>;
export type DiffResultBoth<T> = DiffResult<T, UpdatedValues.both>;
export type DiffResultDeepDiff<T> = DiffResult<T, UpdatedValues.bothWithDeepDiff>;

/**
 * Compare two arrays of objects, finding added, removed, updated and
 * identical objects. Details the differences between updated objects.
 */
function diff<
  T extends object,
  Mode extends UpdatedValues,
> (
  first: readonly T[] | undefined,
  second: readonly T[] | undefined,
  idField: (keyof T & string) | undefined,
  options: Options<T, Mode> & { updatedValues: Mode },
): DiffResult<T, Mode>;
function diff<T extends object> (
  first?: readonly T[],
  second?: readonly T[],
  idField?: keyof T & string,
  options?: Options<T, UpdatedValues.second>,
): DiffResult<T, UpdatedValues.second>;
function diff<T extends object> (
  first: readonly T[] | undefined,
  second: readonly T[] | undefined,
  idField: (keyof T & string) | undefined,
  options: Options<T>,
): DiffResult<T>;
function diff<T extends object> (
  first: readonly T[] = [],
  second: readonly T[] = [],
  idField: keyof T & string = DEFAULT_ID_FIELD as keyof T & string,
  options: Options<T> = {},
): DiffResult<T> {
  const opts = resolveOptions<T, UpdatedValues>(first, second, idField, options);
  const key = idField;

  const firstIndex = indexById(first, key);
  const classified = classify(second, firstIndex, key, opts.compareFunction);
  const removed = findRemoved(first, second, firstIndex, key);
  const updated = formatUpdated(
    classified.updated,
    firstIndex,
    key,
    opts.updatedValues,
  );

  return {
    added: classified.added,
    same: classified.same,
    updated,
    removed,
  };
}

// Object.assign keeps the enum available on the callable default export without
// the unreachable fallback branch emitted by TypeScript namespace merging.
const diffWithUpdatedValues = Object.assign(diff, {
  updatedValues: UpdatedValues,
});

export default diffWithUpdatedValues;
