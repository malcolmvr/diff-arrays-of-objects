import deepDiff from './deep-diff/index.js';
import type { Diff } from './deep-diff/changes.js';
import { getId } from './identity.js';
import { UpdatedValues } from './resolve-options.js';

export type UpdatedEntry<T, Mode extends UpdatedValues> =
  Mode extends UpdatedValues.both
    ? [T, T]
    : Mode extends UpdatedValues.bothWithDeepDiff
      ? [T, T, Diff[]]
      : T;

/** Formats the `updated` array according to the chosen `UpdatedValues` mode. */
export function formatUpdated<T extends object, Mode extends UpdatedValues> (
  updated: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
  updatedValues: Mode,
): UpdatedEntry<T, Mode>[] {
  let result: T[] | [T, T][] | [T, T, Diff[]][];

  switch (updatedValues) {
    case UpdatedValues.first:
      result = updated
        .map(item => firstIndex[String(getId(idField)(item))])
        .filter((item): item is T => item !== undefined);
      break;

    case UpdatedValues.second:
      result = [...updated];
      break;

    case UpdatedValues.both:
      result = updated.map((item) => {
        const original = firstIndex[String(getId(idField)(item))];
        if (original === undefined) {
          throw new Error('updated item is absent from the first array');
        }
        return [original, item] as [T, T];
      });
      break;

    case UpdatedValues.bothWithDeepDiff:
      result = updated.map((item) => {
        const original = firstIndex[String(getId(idField)(item))];
        if (original === undefined) {
          throw new Error('updated item is absent from the first array');
        }
        return [original, item, deepDiff(original, item) ?? []] as [T, T, Diff[]];
      });
      break;

    default:
      throw new Error(
        'diff-arrays-of-objects error: reached the end of the UpdatedValues switch statement without taking a branch',
      );
  }

  return result as UpdatedEntry<T, Mode>[];
}
