import { isArray, isEqual, isFunction, isObject, isString } from 'lodash';
import {
  Options,
  ResolvedOptions,
  UpdatedValues,
} from './types';

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
export function resolveOptions<T> (
  first: unknown,
  second: unknown,
  idField: unknown,
  options: unknown,
): ResolvedOptions<T> {
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

  const opts: Options<T> = {
    compareFunction: isEqual,
    updatedValues: defaultUpdatedValues,
    ...(options as Options<T>),
  };

  if (typeof opts.updatedValues !== 'number' || !updatedValuesSet.has(opts.updatedValues)) {
    fail('"options.updatedValues" must be a one of the ".updatedValues" but is not');
  }
  if (!isFunction(opts.compareFunction)) {
    fail('"options.compareFunction" must be a function but is not');
  }

  return {
    compareFunction: opts.compareFunction,
    updatedValues: opts.updatedValues,
  };
}
