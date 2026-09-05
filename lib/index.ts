import { classify } from './classify';
import { formatUpdated } from './format-updated';
import { findRemoved, indexById } from './identity';
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
  const key: string = idField;

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

// Object.assign keeps the enum available on the callable default export without
// the unreachable fallback branch emitted by TypeScript namespace merging.
const diffWithUpdatedValues = Object.assign(diff, {
  updatedValues: UpdatedValues,
});

export default diffWithUpdatedValues;
module.exports = diffWithUpdatedValues;
module.exports.default = diffWithUpdatedValues;
module.exports.updatedValues = UpdatedValues;
