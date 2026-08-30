import { classify, findRemoved, formatUpdated, indexById } from './classify';
import { DEFAULT_ID_FIELD, resolveOptions } from './resolve-options';
import { DiffResult, Options, UpdatedValues } from './types';

export * from './types';

/**
 * Compare two arrays of objects, finding added, removed, updated and
 * identical objects. Details the differences between updated objects.
 */
function diff<T> (
  first: T[] = [],
  second: T[] = [],
  idField: keyof T & string | string = DEFAULT_ID_FIELD,
  options: Options<T> = {},
): DiffResult<T> {
  const opts = resolveOptions<T>(first, second, idField, options);
  const key = idField as string;

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
  } as DiffResult<T>;
}

// eslint-disable-next-line no-redeclare
namespace diff {
  export const updatedValues = UpdatedValues;
}

export default diff;
module.exports = diff;
module.exports.default = diff;
module.exports.updatedValues = UpdatedValues;
