import isArray from 'lodash/isArray.js';
import isEqual from 'lodash/isEqual.js';
import isFunction from 'lodash/isFunction.js';
import isObject from 'lodash/isObject.js';
import isString from 'lodash/isString.js';

/** Controls which values are returned for updated records. */
export enum UpdatedValues {
  first = 1,
  second = 2,
  both = 3,
  bothWithDeepDiff = 4,
}

export type CompareFunction<T> = (value: T, other: T) => boolean;

export interface Options<
  T,
  Mode extends UpdatedValues = UpdatedValues,
> {
  compareFunction?: CompareFunction<T>;
  updatedValues?: Mode;
}

export interface ResolvedOptions<
  T,
  Mode extends UpdatedValues = UpdatedValues,
> {
  compareFunction: CompareFunction<T>;
  updatedValues: Mode;
}

export const DEFAULT_ID_FIELD = 'id';

export const errorPrefix = 'diff-arrays-of-objects error:';

export const defaultUpdatedValues: UpdatedValues = UpdatedValues.second;

const updatedValuesSet: ReadonlySet<number> = new Set(
  Object.values(UpdatedValues).filter(
    (v): v is number => typeof v === 'number',
  ),
);

function fail (message: string): never {
  throw new Error(`${errorPrefix} ${message}`);
}

/**
 * Validates the arguments passed to `diff` and resolves the options,
 * filling in defaults for anything not specified.
 */
export function resolveOptions<T, Mode extends UpdatedValues> (
  first: unknown,
  second: unknown,
  idField: unknown,
  options: unknown,
): ResolvedOptions<T, Mode> {
  if (!isArray(first)) {
    fail('"first" parameter must be an array but is not');
  }
  if (!isArray(second)) {
    fail('"second" parameter must be an array but is not');
  }
  if (!isString(idField)) {
    fail('"idField" parameter must be a string but is not');
  }
  if (!isObject(options)) {
    fail('"options" parameter must be an object but is not');
  }

  const opts = {
    compareFunction: isEqual,
    updatedValues: defaultUpdatedValues,
    ...(options as Options<T, Mode>),
  };

  if (typeof opts.updatedValues !== 'number' || !updatedValuesSet.has(opts.updatedValues)) {
    fail('"options.updatedValues" must be a one of the ".updatedValues" but is not');
  }
  if (!isFunction(opts.compareFunction)) {
    fail('"options.compareFunction" must be a function but is not');
  }

  return {
    compareFunction: opts.compareFunction,
    updatedValues: opts.updatedValues as Mode,
  };
}
