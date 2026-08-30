import deepDiff from './deep-diff';
import { getId } from './identity';
import { DeepDiffChange, UpdatedValues } from './types';

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
